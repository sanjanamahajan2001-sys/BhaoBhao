// import { BookingData } from '@/pages/BookingHistory';
// import { BookingDetails } from '@/types/booking.type';
// import React, { createContext, useContext, useState, ReactNode } from 'react';

// interface BookingContextType {
//   bookingState: BookingDetails;
//   setBookingState: React.Dispatch<React.SetStateAction<BookingDetails>>;
//   updateBooking: (updates: Partial<BookingDetails>) => void;
//   resetBooking: () => void;
//   // Rescheduling
//   isRescheduling: boolean;
//   setIsRescheduling: (value: boolean) => void;
//   originalBooking: BookingData | null;
//   setOriginalBooking: (booking: BookingData | null) => void;
// }

// const BookingContext = createContext<BookingContextType | undefined>(undefined);

// export const useBooking = () => {
//   const context = useContext(BookingContext);
//   if (!context) {
//     throw new Error('useBooking must be used within a BookingProvider');
//   }
//   return context;
// };

// interface BookingProviderProps {
//   children: ReactNode;
// }

// export const BookingProvider: React.FC<BookingProviderProps> = ({
//   children,
// }) => {
//   const [bookingState, setBookingState] = useState<BookingDetails>({
//     slots: [],
//   });
//   const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
//   const [originalBooking, setOriginalBooking] = useState<any | null>(null);

//   const updateBooking = (updates: Partial<BookingDetails>) => {
//     setBookingState((prev) => ({ ...prev, ...updates }));
//   };

//   const resetBooking = () => {
//     setBookingState({ slots: [] });
//     setIsRescheduling(false);
//     setOriginalBooking(null);
//   };

//   return (
//     <BookingContext.Provider
//       value={{
//         bookingState,
//         setBookingState,
//         updateBooking,
//         resetBooking,
//         isRescheduling,
//         setIsRescheduling,
//         originalBooking,
//         setOriginalBooking,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };
'use client';

import type { BookingData } from '@/pages/BookingHistory';
import type {
  BookingDetails,
  ServiceWithPricing,
  Pets,
  ServicePetConnection,
  PricingOption,
} from '@/types/booking.type';
import type React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface BookingContextType {
  bookingState: BookingDetails;
  setBookingState: React.Dispatch<React.SetStateAction<BookingDetails>>;
  updateBooking: (updates: Partial<BookingDetails>) => void;
  resetBooking: () => void;
  // Multi-selection methods
  addServicePetConnection: (service: ServiceWithPricing, pet: Pets) => void;
  removeServicePetConnection: (connectionId: string) => void;
  updateServicePetConnection: (
    connectionId: string,
    updates: Partial<ServicePetConnection>
  ) => void;
  generateAPIPayload: () => any;
  // Rescheduling
  isRescheduling: boolean;
  setIsRescheduling: (value: boolean) => void;
  originalBooking: BookingData | null;
  setOriginalBooking: (booking: BookingData | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const [bookingState, setBookingState] = useState<BookingDetails>({
    slots: [],
    selectedServices: [],
    selectedPets: [],
    connections: [],
  });
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [originalBooking, setOriginalBooking] = useState<any | null>(null);

  const updateBooking = (updates: Partial<BookingDetails>) => {
    setBookingState((prev) => ({ ...prev, ...updates }));
  };

  // Helper function to get max price from pricing array
  const getMaxPrice = (pricing: PricingOption[]): PricingOption => {
    return pricing.reduce((max, current) =>
      current.discounted_price > max.discounted_price ? current : max
    );
  };

  // Method to create service-pet connections
  const addServicePetConnection = (service: ServiceWithPricing, pet: Pets) => {
    const connectionId = `${service.id}-${pet.id}`;
    const maxPrice = getMaxPrice(service.pricing);

    setBookingState((prev: BookingDetails) => {
      // check in latest state
      if (prev?.connections?.some((c) => c.id === connectionId)) {
        return prev;
      }

      const newConnection: ServicePetConnection = {
        id: connectionId,
        service,
        pet,
        selectedPricing: maxPrice,
      };

      return {
        ...prev,
        connections: [...(prev?.connections || []), newConnection],
      };
    });
  };

  // Method to remove service-pet connections
  const removeServicePetConnection = (connectionId: string) => {
    setBookingState((prev) => ({
      ...prev,
      connections:
        prev.connections?.filter((conn) => conn.id !== connectionId) || [],
    }));
  };

  // Method to update service-pet connections
  const updateServicePetConnection = (
    connectionId: string,
    updates: Partial<ServicePetConnection>
  ) => {
    setBookingState((prev) => ({
      ...prev,
      connections:
        prev.connections?.map((conn) =>
          conn.id === connectionId ? { ...conn, ...updates } : conn
        ) || [],
    }));
  };

  const resetBooking = () => {
    setBookingState({
      slots: [],
      selectedServices: [],
      selectedPets: [],
      connections: [],
    });
    setIsRescheduling(false);
    setOriginalBooking(null);
    // NOTE: Clear booking draft so landing CTA doesn't show "View booking".
    if (typeof window !== 'undefined') {
      localStorage.removeItem('booking_draft');
    }
  };

  const generateAPIPayload = () => {
    const connections = bookingState.connections || [];

    // Group connections by service and pricing
    const serviceGroups: { [key: string]: ServicePetConnection[] } = {};
    connections.forEach((connection) => {
      const key = `${connection.service.id}-${connection.selectedPricing.id}`;
      if (!serviceGroups[key]) {
        serviceGroups[key] = [];
      }
      serviceGroups[key].push(connection);
    });

    // Transform to API format
    const services = Object.values(serviceGroups).map((group) => {
      const firstConnection = group[0];
      const pets = group.map((conn) => conn.pet.id);
      const totalAmount = group.reduce(
        (sum, conn) => sum + conn.selectedPricing.discounted_price,
        0
      );
      const tax = Math.round(totalAmount * 0.1); // 10% tax

      return {
        service_id: firstConnection.service.id,
        service_pricing_id: firstConnection.selectedPricing.id,
        amount: totalAmount,
        tax: tax,
        total: totalAmount + tax,
        pets: pets,
      };
    });

    // Collect all unique timeslots

    // ✅ Convert bookingState.slots (date + time → ISO)
    const slots = (bookingState.slots || [])
      .map((slot: { date: string; time: string }) => {
        if (slot.date && slot.time) {
          const [startTime] = slot.time.split(' - '); // use start time
          const isoString = new Date(
            `${slot.date}T${startTime}:00`
          ).toISOString();
          return isoString;
        }
        return null;
      })
      .filter(Boolean);

    // Calculate totals
    const totalAmount = services.reduce(
      (sum, service) => sum + service.amount,
      0
    );
    const totalTax = services.reduce((sum, service) => sum + service.tax, 0);

    // Get unique pets with their details
    const uniquePets = connections.reduce((acc, conn) => {
      if (!acc.find((p) => p.pet_id === conn.pet.id)) {
        acc.push({
          pet_id: conn.pet.id,
          nature: conn.pet.nature || '',
          health_conditions: conn.pet.health_conditions || '',
          skin_condition: conn.pet.skin_condition || '',
          comments: conn.pet.comments || '',
        });
      }
      return acc;
    }, [] as any[]);

    return {
      IsNew: !bookingState?.booking?.id,
      booking_id: bookingState?.booking?.id || undefined,
      // customer_id: bookingState.customer_id || 1,
      // groomer_id: bookingState.groomer_id || 1,
      address_id: bookingState.address?.id || 1,
      slots: slots,
      appointment_time_slot: bookingState.appointment_time_slot || undefined,
      services: services,
      totals: {
        amount: totalAmount,
        tax: totalTax,
        total: totalAmount + totalTax,
      },
      pets: uniquePets,
      notes: bookingState.notes || '',
      payment_method: bookingState.payment_method || 'COD',
    };
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setBookingState,
        updateBooking,
        resetBooking,
        addServicePetConnection,
        removeServicePetConnection,
        updateServicePetConnection,
        generateAPIPayload,
        isRescheduling,
        setIsRescheduling,
        originalBooking,
        setOriginalBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
