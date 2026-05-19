import React from 'react';
import { BookingCard } from './BookingCard';
import { BookingData } from '@/types/bookingHistory.type';

interface BookingListProps {
  bookings: BookingData[];
  type: 'upcoming' | 'past';
  onShowTransactionModal: (bookingId: number) => void;
  bookingActions: {
    handleCancel: (bookingId: number) => Promise<void>;
    handleReschedule: (bookingData: BookingData) => void;
    isLoading: boolean;
  };
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  type,
  onShowTransactionModal,
  bookingActions,
}) => {
  return (
    <div className="space-y-4">
      {bookings.map((bookingData) => (
        <BookingCard
          key={bookingData.booking.id}
          bookingData={bookingData}
          type={type}
          onShowTransactionModal={onShowTransactionModal}
          bookingActions={bookingActions}
        />
      ))}
    </div>
  );
};
