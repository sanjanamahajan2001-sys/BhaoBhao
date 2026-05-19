import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  keepPreviousData,
  QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Search, Star, Clock, Filter, X, DogIcon } from 'lucide-react';

import { Address, Category, Pets, Service } from '@/types/booking.type';
import BookingProgress from '@/components/booking/BookingProgress';
import ServiceStep from '@/components/booking/ServiceStep';
import PetStep from '@/components/booking/PetStep';
import LocationStep from '@/components/booking/LocationStep';
import ScheduleStep from '@/components/booking/ScheduleStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';
import CategoryStep from '@/components/booking/CategoryStep';
import {
  fetchCategories,
  fetchSubCategoriesWithServices,
} from '@/features/booking/FetchBookingServices';
import usePets, { Pet } from '@/hooks/pets/usePets';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import { convertTo24Hr } from '@/features/booking/ConvertTo24Hr';
import { useAddresses } from '@/hooks/address/useAddresses';

interface SubCategoryWithServices {
  id: number;
  sub_category_name: string;
  photos: string[];
  description: string;
  services: ServiceWithPricing[];
}

interface ServiceWithPricing {
  id: number;
  name: string;
  photos: string[];
  smallDescription: string;
  description: string;
  rating: number;
  totalRatings: number;
  durationMinutes: number;
  petType: string[];
  petBreed: string[];
  gender: string[];
  pricing: PricingOption[];
  is_addon?: boolean; // Added for AddonStep logic
}

interface PricingOption {
  id: number;
  pet_size: string;
  groomer_level: string;
  mrp: number;
  discounted_price: number;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    bookingState,
    updateBooking,
    resetBooking,
    isRescheduling,
    originalBooking,
  } = useBooking();

  // ✅ Use context for booking data, local state for UI state
  const { category: selectedCategory, service: selectedService } = bookingState;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddPet, setShowAddPet] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 5000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<ServiceWithPricing[]>([]);
  const bookingDraftKey = 'booking_draft'; // NOTE: Store draft booking for resume CTA.

  // Local state only for step logic
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryWithServices | null>(null);
  const hasRestoredDraft = useRef(false); // NOTE: Prevent rehydrating booking draft twice.
  const isRestoringDraft = useRef(false); // NOTE: Skip reset while draft is restoring.
  const hasDraftInStorage = useRef(false); // NOTE: Track draft presence to avoid reset.

  const queryClient = useQueryClient();

  // ✅ Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // ✅ Reset local state when booking state is reset (e.g., when clicking logo or "Add New Booking")
  useEffect(() => {
    // If booking state is empty and we're not rescheduling, reset local state
    const isBookingStateEmpty = !bookingState.service &&
      !bookingState.category &&
      (!bookingState.pets || bookingState.pets.length === 0) &&
      (!bookingState.slots || bookingState.slots.length === 0) &&
      !bookingState.address;

    if (
      !isRescheduling &&
      !isRestoringDraft.current &&
      !hasDraftInStorage.current &&
      isBookingStateEmpty &&
      currentStep > 1
    ) {
      setCurrentStep(1);
      setSelectedAddons([]);
      setSelectedSubCategory(null);
      setSearchQuery('');
      setPriceFilter({ min: 0, max: 5000 });
      setShowAddPet(false);
      setShowAddAddress(false);
    }
  }, [bookingState.service, bookingState.category, bookingState.pets, bookingState.slots, bookingState.address, isRescheduling, currentStep]);

  useEffect(() => {
    if (hasRestoredDraft.current || isRescheduling) return;
    if (typeof window === 'undefined') return;

    const savedDraft = localStorage.getItem(bookingDraftKey);
    hasDraftInStorage.current = !!savedDraft;
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft);
      isRestoringDraft.current = true; // NOTE: Prevent reset while we hydrate draft.
      if (draft?.bookingState) {
        updateBooking(draft.bookingState); // NOTE: Restore booking state for resume flow.
      }
      if (typeof draft?.currentStep === 'number') {
        setCurrentStep(draft.currentStep); // NOTE: Restore last step for resume flow.
      }
      if (Array.isArray(draft?.selectedAddons)) {
        setSelectedAddons(draft.selectedAddons); // NOTE: Restore add-ons for resume flow.
      }
      if (draft?.selectedSubCategory) {
        setSelectedSubCategory(draft.selectedSubCategory); // NOTE: Restore subcategory for step validation.
      }
      isRestoringDraft.current = false;
      hasRestoredDraft.current = true;
    } catch (error) {
      isRestoringDraft.current = false;
      console.error('Failed to restore booking draft:', error);
    }
  }, [isRescheduling, updateBooking, bookingDraftKey]);

  useEffect(() => {
    if (isRescheduling) return;
    if (typeof window === 'undefined') return;

    const hasDraftData =
      !!bookingState.service ||
      !!bookingState.category ||
      (bookingState.pets?.length || 0) > 0 ||
      (bookingState.slots?.length || 0) > 0 ||
      !!bookingState.address ||
      selectedAddons.length > 0;

    if (hasDraftData) {
      const draftPayload = {
        bookingState,
        currentStep,
        selectedAddons,
        selectedSubCategory,
        savedAt: new Date().toISOString(), // NOTE: Track draft timestamp for resume flow.
      };
      localStorage.setItem(bookingDraftKey, JSON.stringify(draftPayload));
      hasDraftInStorage.current = true;
    } else {
      localStorage.removeItem(bookingDraftKey);
      hasDraftInStorage.current = false;
    }
  }, [
    bookingState,
    currentStep,
    selectedAddons,
    selectedSubCategory,
    isRescheduling,
    bookingDraftKey,
  ]);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // React Query for categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Always skip Category step and default to "Pet Grooming" (Category ID 1)
  useEffect(() => {
    if (
      categoriesData?.data &&
      !categoriesLoading &&
      currentStep === 1
    ) {
      const petGroomingCategory = categoriesData.data.find(
        (cat: Category) => cat.id === 1
      ) || categoriesData.data[0];
      
      if (petGroomingCategory) {
        updateBooking({ category: petGroomingCategory });
        setCurrentStep(2); // ⏩ Skip to Service step
      }
    }
  }, [categoriesData, categoriesLoading, currentStep, updateBooking]);

  // React Query for subcategories with services
  const {
    data: subCategoriesData,
    isLoading: subCategoriesLoading,
    error: subCategoriesError,
  } = useQuery({
    queryKey: ['subCategories', selectedCategory?.id],
    queryFn: () => fetchSubCategoriesWithServices(selectedCategory!.id),
    enabled: !!selectedCategory,
    placeholderData: keepPreviousData,
  });
  // Add these hooks to get actual pets and addresses data
  const {
    data: pets = [],
    isLoading: petsLoading,
    error: petsError,
  } = usePets();

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
  } = useAddresses();
  // Effect to pre-fill form when rescheduling
  // ✅ Use ref to track if we've already pre-filled data (prevents infinite loop)
  const hasPrefilled = useRef(false);

  // Pre-fill when rescheduling
  useEffect(() => {
    if (
      isRescheduling &&
      originalBooking &&
      categoriesData &&
      !categoriesLoading &&
      !subCategoriesLoading &&
      !petsLoading &&
      !addressesLoading &&
      pets.length > 0 &&
      addresses.length > 0 &&
      !hasPrefilled.current // ✅ Only run once
    ) {
      hasPrefilled.current = true; // Mark as pre-filled

      // ✅ Navigate to Service step when rescheduling (step 2)
      if (currentStep === 1) {
        setCurrentStep(2);
      }

      const { booking, pet, service, service_pricing, address } =
        originalBooking;

      // ✅ Category
      if (service?.category_id) {
        const categoryData = categoriesData?.data?.find(
          (cat: Category) => cat.id === service.category_id
        );
        if (categoryData) {
          updateBooking({ category: categoryData });
        }
      }

      // ✅ SubCategory & Service - Only set if not already set to allow user to change
      if (service?.sub_category_id && subCategoriesData?.data && !bookingState.service) {
        const subCat = subCategoriesData.data.find(
          (sub: SubCategoryWithServices) =>
            Number(sub.id) === Number(service.sub_category_id)
        );

        if (subCat) {
          setSelectedSubCategory(subCat);

          const selectedSrv = subCat.services.find(
            (srv: ServiceWithPricing) => Number(srv.id) === Number(service.id)
          );

          if (selectedSrv) {
            updateBooking({ service: selectedSrv as unknown as Service });

            if (service_pricing) {
              updateBooking({ selectedPricing: service_pricing });
            }
          }
        }
      } else if (service?.sub_category_id && subCategoriesData?.data) {
        // If service is already set, just ensure subcategory is set for validation
        const subCat = subCategoriesData.data.find(
          (sub: SubCategoryWithServices) =>
            Number(sub.id) === Number(service.sub_category_id)
        );
        if (subCat) {
          setSelectedSubCategory(subCat);
        }
      }

      // ✅ Pets
      if (pet && pets.length > 0) {
        const actualPet = pets.find((p: Pet) => p.id === pet.id);
        if (actualPet) {
          updateBooking({ pets: [actualPet] });
        }
      }

      // ✅ Address
      if (address && addresses.length > 0) {
        const actualAddress = addresses.find(
          (addr: Address) => addr.id === address.id
        );
        if (actualAddress) {
          updateBooking({ address: actualAddress });
        }
      }

      // ✅ Pricing
      if (service_pricing) updateBooking({ selectedPricing: service_pricing });

      // ✅ Appointment slots - Fix timezone issue
      if (booking.appointment_time_slot) {
        const date = new Date(booking.appointment_time_slot);
        // ✅ Use local date components to avoid timezone shift
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        updateBooking({
          slots: [{ date: formattedDate, time: formattedTime }],
        });
      }

      // ✅ Notes
      if (booking.notes) updateBooking({ notes: booking.notes });

      // ✅ Add-ons: Only pre-fill if not already set (allows user to change)
      if (selectedAddons.length === 0 && originalBooking.addon_services && originalBooking.addon_services.length > 0 && subCategoriesData?.data) {
        const allServices = subCategoriesData.data.flatMap(
          (sub) => sub.services
        );

        const originalAddonServiceIds = new Set(
          originalBooking.addon_services.map((a: any) => a.service_id)
        );

        const addonsToSelect = allServices.filter((srv) =>
          originalAddonServiceIds.has(srv.id) && srv.is_addon === true
        );

        setSelectedAddons(addonsToSelect);
      }
    }

    // ✅ Reset ref when rescheduling ends
    if (!isRescheduling) {
      hasPrefilled.current = false;
    }
  }, [
    isRescheduling,
    originalBooking,
    categoriesData,
    categoriesLoading,
    subCategoriesLoading,
    subCategoriesData,
    pets,
    addresses,
    petsLoading,
    addressesLoading,
    currentStep,
    setCurrentStep,
    // ✅ Remove updateBooking, bookingState.service, and selectedAddons from dependencies
    // to prevent infinite loops - we use ref to ensure it only runs once
  ]);

  const steps = [
    { id: 1, title: 'Category', description: '' },
    { id: 2, title: 'Service', description: '' },
    { id: 3, title: 'Add-on', description: '' },
    { id: 4, title: 'Pet', description: '' },
    { id: 5, title: 'Location', description: '' },
    { id: 6, title: 'Schedule', description: '' },
    { id: 7, title: 'Confirm', description: '' },
  ];

  // ✅ Helper function to auto-scroll to bottom on mobile when option is selected
  const scrollToBottomOnMobile = () => {
    if (window.innerWidth < 640) {
      setTimeout(() => {
        // First, try to find the Next button directly by class
        const nextButton = document.querySelector('.next-button') as HTMLElement;
        if (nextButton) {
          // Get button position and add extra padding for visibility
          const buttonRect = nextButton.getBoundingClientRect();
          const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
          const buttonTop = buttonRect.top + scrollPosition;

          // Add extra padding (100px) to ensure button is fully visible with space below
          const targetScroll = buttonTop + buttonRect.height - window.innerHeight + 100;

          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        } else {
          // Fallback: try the container
          const nextButtonContainer = document.querySelector('.next-button-container') as HTMLElement;
          if (nextButtonContainer) {
            const containerRect = nextButtonContainer.getBoundingClientRect();
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            const containerTop = containerRect.top + scrollPosition;
            const targetScroll = containerTop + containerRect.height - window.innerHeight + 100;

            window.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
          } else {
            // Final fallback: scroll to bottom of page with extra padding
            const scrollHeight = Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.offsetHeight,
              document.body.clientHeight,
              document.documentElement.clientHeight
            );
            window.scrollTo({ top: scrollHeight + 100, behavior: 'smooth' });
          }
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  const handleAddonSelect = (addon: ServiceWithPricing) => {
    setSelectedAddons((prev) => {
      const alreadySelected = prev.find((a) => a.id === addon.id);
      if (alreadySelected) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleConfirmBooking = async () => {
    if (!user || !bookingState) return;

    setLoading(true);
    setError('');

    try {
      // ⏱ format appointment slots
      const appointment_time_slots =
        bookingState.slots?.map(({ date, time }) => {
          const localDate = new Date(`${date}T${convertTo24Hr(time)}:00+05:30`);
          return localDate.toISOString();
        }) || [];

      // 🧾 main service tax & totals
      // ✅ This logic is correct as long as slots.length is always 1
      const inclusivePrice =
        bookingState?.selectedPricing?.discounted_price || 0;
      const basePrice = inclusivePrice / 1.18; // NOTE: Display-only inclusive pricing; store base for GST breakdown.
      const baseTax = inclusivePrice - basePrice; // NOTE: Tax is the inclusive minus base.
      const baseTotal = inclusivePrice; // NOTE: Keep total as inclusive price.

      // ✅ build main service item
      const mainServiceItem = {
        service_pricing_id: bookingState.selectedPricing?.id,
        parent_service_id: null,
        amount: basePrice,
        tax: baseTax,
        total: baseTotal,
      };

      // ✅ build addon service items
      const addonItems = selectedAddons.map((addon) => {
        const selectedPrice = addon.pricing?.[0]; // assuming first pricing option
        const addonInclusive =
          selectedPrice?.discounted_price || selectedPrice?.mrp || 0;
        const addonAmount = addonInclusive / 1.18; // NOTE: Store base amount for GST breakdown.
        const addonTax = addonInclusive - addonAmount; // NOTE: Tax is the inclusive minus base.
        const addonTotal = addonInclusive; // NOTE: Keep total as inclusive price.

        return {
          service_pricing_id: selectedPrice?.id,
          parent_service_id: selectedService?.id,
          amount: addonAmount,
          tax: addonTax,
          total: addonTotal,
        };
      });

      // ✅ combine all service items
      const bookingServices = [mainServiceItem, ...addonItems];

      // ✅ calculate grand totals
      const totalAmount = bookingServices.reduce((sum, s) => sum + s.amount, 0);
      const totalTax = bookingServices.reduce((sum, s) => sum + s.tax, 0);
      const totalWithTax = totalAmount + totalTax;

      const basePayload = {
        pet_id: bookingState.pets?.[0].id,
        service_id: selectedService?.id,
        service_pricing_id: bookingState.selectedPricing?.id,
        address_id: bookingState.address?.id,
        appointment_time_slots,
        payment_method: 'COD',
        amount: totalAmount,
        tax: totalTax,
        total: totalWithTax,
        notes: bookingState.notes || '',
        // ✅ **FIX 1: Check root pet.nature as a fallback**
        nature:
          bookingState.nature ||
          bookingState?.pets?.[0]?.pet_details?.nature ||
          bookingState?.pets?.[0]?.nature ||
          '',
        // ✅ **FIX 2: Check root pet.health_conditions as a fallback**
        health_conditions:
          bookingState.health_conditions ||
          bookingState?.pets?.[0]?.pet_details?.health_conditions ||
          bookingState?.pets?.[0]?.health_conditions ||
          '',
        skin_condition:
          bookingState.skin_condition ||
          bookingState?.pets?.[0]?.pet_details?.skin_condition ||
          bookingState?.pets?.[0]?.skin_condition ||
          '',
        comments:
          bookingState.comments ||
          bookingState?.pets?.[0]?.pet_details?.comments ||
          bookingState?.pets?.[0]?.comments ||
          '',
        bookingServices,
      };

      let response;
      if (isRescheduling && originalBooking?.booking.id) {
        response = await axiosInstance.put(
          `/bookings/update/${originalBooking?.booking.id}`,
          basePayload
        );
        toast.success('Booking Updated Successfully');
      } else {
        response = await axiosInstance.post('/bookings/new', basePayload);
        toast.success('Booking Successful');
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
        queryClient.invalidateQueries({ queryKey: ['pets'] }),
      ]);

      if (response.status !== 200) throw new Error('Booking operation failed');

      navigate('/history');
      resetBooking();
    } catch (err) {
      console.error('Booking error:', err);
      setError(
        isRescheduling
          ? 'Failed to update booking. Please try again.'
          : 'Failed to create booking. Please try again.'
      );
      toast.error(
        isRescheduling
          ? 'Failed to update booking, please try again'
          : 'Booking failed, please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  // Category & service selections
  const handleCategorySelect = (category: Category) => {
    console.log('Selected category:', category);
    setSelectedSubCategory(null); // Reset local sub-category state

    // ✅ Reset all dependent state in the context
    updateBooking({
      category,
      service: undefined,
      selectedPricing: undefined,
    });

    // ✅ Auto-scroll to bottom on mobile when category is selected
    scrollToBottomOnMobile();
  };

  const handleServiceSelect = (
    service: Service,
    subCategory: SubCategoryWithServices
  ) => {
    setSelectedSubCategory(subCategory);

    // Update service in booking state
    updateBooking({
      service: service,
      selectedPricing: undefined,
    });

    // Clear addons when service changes during edit
    if (isRescheduling) {
      setSelectedAddons([]);
    }

    // ✅ Auto-scroll to bottom on mobile when service is selected
    scrollToBottomOnMobile();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== null; // Context value
      case 2:
        return (
          selectedService !== null && // Context value
          selectedSubCategory !== null && // Local value
          bookingState.selectedPricing !== undefined // Context value
        );
      case 3:
        // ✅ Add-on step — can always proceed, even if no addon selected
        return true;
      case 4:
        // ✅ Pet step
        return bookingState.pets && bookingState.pets.length > 0;
      case 5:
        // ✅ Location step
        return bookingState.address !== undefined;
      case 6:
        return (
          Array.isArray(bookingState.slots) &&
          bookingState.slots.length > 0 &&
          !!bookingState.slots[0]?.date &&
          !!bookingState.slots[0]?.time
        );
      case 7:
        return true;
      default:
        return false;
    }
  };

  // Adjust visible step index for progress display (always skip Category selection)
  const visibleStepIndex = currentStep - 1;

  // Adjust total visible steps (always skip Category selection)
  const visibleSteps = steps.slice(1);

  // ✅ Handle browser back button and swipe gestures for mobile
  useEffect(() => {
    // Push current step to history when step changes
    window.history.pushState({ step: currentStep }, '', window.location.href);

    // Handle browser back button
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.step && e.state.step < currentStep) {
        setCurrentStep(e.state.step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (currentStep > 1) {
        // If no state, go back one step
        setCurrentStep((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Handle swipe gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchStartX = touchEvent.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchEndX = touchEvent.changedTouches[0].screenX;
      const swipeThreshold = 50; // Minimum swipe distance

      // Swipe right (go back)
      if (touchStartX - touchEndX > swipeThreshold && currentStep > 1) {
        handleBack();
      }
    };

    const container = document.querySelector('.booking-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentStep]);

  // console.log('BookingState:', bookingState);
  return (
    <div className="max-w-4xl mx-auto booking-container">
      <BookingProgress currentStep={visibleStepIndex} steps={visibleSteps} />


      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {(categoriesError ||
        subCategoriesError ||
        petsError ||
        addressesError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            Failed to load data. Please try again.
          </div>
        )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 min-h-[500px]">
        {currentStep === 1 && !categoriesLoading && (
          <CategoryStep
            categories={categoriesData?.data || []}
            selectedCategory={selectedCategory} // 👈 Use context value
            onCategorySelect={handleCategorySelect}
            isLoading={
              categoriesLoading ||
              subCategoriesLoading ||
              petsLoading ||
              addressesLoading
            }
          />
        )}

        {currentStep === 2 && !subCategoriesLoading && (
          <ServiceStep
            searchQuery={searchQuery}
            priceFilter={priceFilter}
            selectedService={bookingState.service} // 👈 Always use latest from context
            subCategoriesData={subCategoriesData?.data || []}
            onSearchChange={setSearchQuery}
            onPriceFilterChange={setPriceFilter}
            onServiceSelect={handleServiceSelect}
            onResetPriceFilter={() => setPriceFilter({ min: 0, max: 5000 })}
          />
        )}

        {currentStep === 3 && !subCategoriesLoading && (
          <AddonStep
            subCategoriesData={subCategoriesData?.data || []}
            onAddonSelect={handleAddonSelect}
            selectedAddons={selectedAddons}
          />
        )}

        {currentStep === 4 && (
          <PetStep
            selectedPets={bookingState.pets || []}
            showAddPet={showAddPet}
            loading={loading}
            onTogglePetSelection={(pet) => {
              updateBooking({ pets: [pet] });
              scrollToBottomOnMobile();
            }}
            onShowAddPet={() => setShowAddPet(true)}
            onHideAddPet={() => setShowAddPet(false)}
          />
        )}

        {currentStep === 5 && (
          <LocationStep
            selectedAddress={bookingState.address || null}
            showAddAddress={showAddAddress}
            loading={loading}
            onSelectAddress={(address) => {
              updateBooking({ address });
              scrollToBottomOnMobile();
            }}
            onShowAddAddress={() => setShowAddAddress(true)}
            onHideAddAddress={() => setShowAddAddress(false)}
          />
        )}

        {currentStep === 6 && (
          <ScheduleStep
            slot={bookingState.slots?.[0] || null}
            onSlotSelect={(slot) => {
              updateBooking({ slots: [slot] });
              scrollToBottomOnMobile();
            }}
            isRescheduling={isRescheduling}
          />
        )}
        {currentStep === 7 && (
          <div>
            <ConfirmationStep
              bookingDetails={{
                ...bookingState,
                slots: bookingState.slots || [], // ✅ Ensure slots array exists
                selectedAddons: selectedAddons.map((a) => ({
                  id: a.id,
                  name: a.name,
                  price:
                    a.pricing?.[0]?.discounted_price ||
                    a.pricing?.[0]?.mrp ||
                    0,
                })),
              }}
              updateBooking={updateBooking}
              onConfirm={handleConfirmBooking}
              goToStep={goToStep}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons - Bottom (All screens) */}
      <div className="flex items-center justify-between mt-8 next-button-container">
        <button
          onClick={handleBack}
          disabled={currentStep === 2 || loading}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {currentStep !== steps.length && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="next-button flex items-center space-x-2 px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-teal-500"
          >
            <span>Next</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------- ADDON STEP -----------------
// ✅ Moved outside the Booking component
const AddonStep: React.FC<{
  subCategoriesData: SubCategoryWithServices[];
  onAddonSelect: (service: ServiceWithPricing) => void;
  selectedAddons: ServiceWithPricing[];
}> = ({ subCategoriesData, onAddonSelect, selectedAddons }) => {
  const formatAddonPrice = (price: number) => {
    const roundedPrice = Math.round(price); // NOTE: Display-only rounding for Step 2 add-on prices.
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // NOTE: Display-only, no decimals for Step 2 add-on prices.
    }).format(roundedPrice);
  };
  // ✅ Filter only services that are marked as add-ons
  const addonServices = subCategoriesData.flatMap((subCategory) =>
    subCategory.services.filter((srv) => srv.is_addon === true)
  );

  if (!addonServices.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        No add-ons available for the selected service.
      </div>
    );
  }

  // ✅ Price calculation logic
  const getAddonPrice = (addon: ServiceWithPricing) => {
    if (!addon.pricing || addon.pricing.length === 0)
      return { discounted: 0, original: 0 };

    const discounted = Math.min(
      ...addon.pricing.map((p) => p.discounted_price ?? p.mrp ?? 0)
    );
    const original = Math.min(...addon.pricing.map((p) => p.mrp ?? discounted));

    return { discounted, original };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Add-on
        </h2>
        <p className="text-gray-600 max-sm:hidden">
          Select the perfect add-on for your pet service
        </p>
      </div>

      <div className="relative pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addonServices.map((addon) => {
            const isSelected = selectedAddons.some((a) => a.id === addon.id);
            const { discounted, original } = getAddonPrice(addon);

            return (
              <div
                key={addon.id}
                onClick={() => onAddonSelect(addon)}
                className={`relative rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-teal-300'
                  }`}
              >
                {/* Selected Badge - Positioned first to avoid overlap */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Add-on Name - Add padding to prevent text overlap */}
                <h3 className={`font-semibold text-gray-800 mb-2 ${isSelected ? 'pr-10' : ''}`}>
                  {addon.name}
                </h3>

                {/* Price */}
                <div className="flex items-center justify-center space-x-2 text-sm font-medium text-green-600">
                  <span>{formatAddonPrice(discounted)}</span>
                  {original > discounted && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatAddonPrice(original)}
                    </span>
                  )}
                </div>
                {/* NOTE: Added tax-inclusive label per client request. */}
                {/* <p className="mt-1 text-xs text-gray-500">Price inclusive of taxes</p> */}
              </div>
            );
          })}
        </div>
        {/* NOTE: Added single tax-inclusive label at card bottom-right per client request. */}
        <p className="absolute bottom-4 right-6 text-xs text-gray-500">
          Price inclusive of taxes
        </p>
      </div>
    </div>
  );
};

export default Booking;
// 'use client';

// import type React from 'react';
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   keepPreviousData,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';
// import { useAuth } from '../contexts/AuthContext';
// import { useBooking } from '../contexts/BookingContext';
// import { ArrowLeft, ArrowRight } from 'lucide-react';

// import type {
//   Address,
//   Category,
//   Pets,
//   ServiceWithPricing,
//   SubCategoryWithServices,
// } from '@/types/booking.type';
// import BookingProgress from '@/components/booking/BookingProgress';
// import LocationStep from '@/components/booking/LocationStep';
// import ScheduleStep from '@/components/booking/ScheduleStep';
// import ConfirmationStep from '@/components/booking/ConfirmationStep';
// import CategoryStep from '@/components/booking/CategoryStep';
// import {
//   fetchCategories,
//   fetchSubCategoriesWithServices,
// } from '@/features/booking/FetchBookingServices';
// import usePets, { type Pet } from '@/hooks/pets/usePets';
// import axiosInstance from '@/utils/axiosInstance';
// import toast from 'react-hot-toast';
// import { convertTo24Hr } from '@/features/booking/ConvertTo24Hr';
// import { useAddresses } from '@/hooks/address/useAddresses';
// import MultiPetStep from '@/components/booking/newMultiComponents/MultiPets';
// import MultiServiceStep from '@/components/booking/newMultiComponents/MultiServiceStep';
// import ServicePetConnectionStep from '@/components/booking/newMultiComponents/ServicePetConnectionStep';
// import MultiScheduleStep from '@/components/booking/newMultiComponents/MultiScheduleStep';
// import MultiConfirmationStep from '@/components/booking/newMultiComponents/MultiConfirmationStep';

// interface PricingOption {
//   id: number;
//   pet_size: string;
//   groomer_level: string;
//   mrp: number;
//   discounted_price: number;
// }

// const Booking: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const {
//     bookingState,
//     updateBooking,
//     resetBooking,
//     addServicePetConnection,
//     removeServicePetConnection,
//     updateServicePetConnection,
//     generateAPIPayload,
//     isRescheduling,
//     originalBooking,
//   } = useBooking();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showAddPet, setShowAddPet] = useState(false);
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [priceFilter, setPriceFilter] = useState({ min: 0, max: 5000 });
//   const [searchQuery, setSearchQuery] = useState('');

//   // Category & service selections
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
//     null
//   );
//   const [selectedSubCategory, setSelectedSubCategory] =
//     useState<SubCategoryWithServices | null>(null);
//   const queryClient = useQueryClient();

//   // React Query for categories
//   const {
//     data: categoriesData,
//     isLoading: categoriesLoading,
//     error: categoriesError,
//   } = useQuery({
//     queryKey: ['categories'],
//     queryFn: fetchCategories,
//   });

//   // React Query for subcategories with services
//   const {
//     data: subCategoriesData,
//     isLoading: subCategoriesLoading,
//     error: subCategoriesError,
//   } = useQuery({
//     queryKey: ['subCategories', selectedCategory?.id],
//     queryFn: () => fetchSubCategoriesWithServices(selectedCategory!.id),
//     enabled: !!selectedCategory,
//     placeholderData: keepPreviousData,
//   });

//   // Add these hooks to get actual pets and addresses data
//   const {
//     data: pets = [],
//     isLoading: petsLoading,
//     error: petsError,
//   } = usePets();

//   const {
//     data: addresses = [],
//     isLoading: addressesLoading,
//     error: addressesError,
//   } = useAddresses();

//   const steps = [
//     { id: 1, title: 'Category', description: 'Choose service category' },
//     { id: 2, title: 'Services', description: 'Select multiple services' },
//     { id: 3, title: 'Pets', description: 'Select your pets' },
//     { id: 4, title: 'Cart', description: 'Connect services to pets' },
//     { id: 5, title: 'Location', description: 'Where to provide services' },
//     { id: 6, title: 'Schedule', description: 'Date & time' },
//     { id: 7, title: 'Confirm', description: 'Review & book' },
//   ];

//   const handleNext = () => {
//     if (currentStep < steps.length) {
//       setCurrentStep(currentStep + 1);
//       setSearchQuery('');
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       setSearchQuery('');
//     }
//   };

//   const handleCategorySelect = (category: Category) => {
//     console.log('Selected category:', category);
//     setSelectedCategory(category);
//     updateBooking({
//       category,
//       selectedServices: [],
//       selectedPets: [],
//       connections: [],
//     });
//   };

//   const handleServiceToggle = (service: ServiceWithPricing) => {
//     const currentServices = bookingState.selectedServices || [];
//     const isSelected = currentServices.some((s) => s.id === service.id);

//     let updatedServices;
//     if (isSelected) {
//       updatedServices = currentServices.filter((s) => s.id !== service.id);
//     } else {
//       updatedServices = [...currentServices, service];
//     }

//     updateBooking({ selectedServices: updatedServices });
//   };

//   const handlePetToggle = (pet: Pets) => {
//     const currentPets = bookingState.selectedPets || [];
//     const isSelected = currentPets.some((p) => p.id === pet.id);

//     let updatedPets;
//     if (isSelected) {
//       updatedPets = currentPets.filter((p) => p.id !== pet.id);
//     } else {
//       updatedPets = [...currentPets, pet];
//     }

//     updateBooking({ selectedPets: updatedPets });
//   };

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return selectedCategory !== null;
//       case 2:
//         return (
//           bookingState.selectedServices &&
//           bookingState.selectedServices.length > 0
//         );
//       case 3:
//         return (
//           bookingState.selectedPets && bookingState.selectedPets.length > 0
//         );
//       case 4:
//         return bookingState.connections && bookingState.connections.length > 0;
//       case 5:
//         return bookingState.address !== undefined;
//       case 6:
//         return (
//           bookingState?.slots?.length || 0 > 0
//           // bookingState.connections &&
//           // bookingState.connections.length > 0 &&
//           // bookingState.connections.every((conn) => conn.timeSlot)
//         );
//       case 7:
//         return true;
//       default:
//         return false;
//     }
//   };

//   // Effect to pre-fill form when rescheduling
//   useEffect(() => {
//     if (
//       isRescheduling &&
//       originalBooking &&
//       categoriesData &&
//       !categoriesLoading &&
//       !subCategoriesLoading &&
//       !petsLoading &&
//       !addressesLoading &&
//       pets.length > 0 &&
//       addresses.length > 0
//     ) {
//       const { booking, pet, service, service_pricing, address } =
//         originalBooking;

//       // ✅ Category
//       if (service?.category_id) {
//         const categoryData = categoriesData?.data?.find(
//           (cat: Category) => cat.id === service.category_id
//         );
//         if (categoryData) {
//           setSelectedCategory(categoryData);
//           updateBooking({ category: categoryData });
//         }
//       }

//       // ✅ SubCategory & Service
//       if (service?.sub_category_id && subCategoriesData?.data) {
//         // Find subcategory
//         const subCat = subCategoriesData.data.find(
//           (sub: SubCategoryWithServices) =>
//             Number(sub.id) === Number(service.sub_category_id)
//         );

//         if (subCat) {
//           setSelectedSubCategory(subCat);

//           // Find actual service inside subcategory
//           const selectedSrv = subCat.services.find(
//             (srv: ServiceWithPricing) => Number(srv.id) === Number(service.id)
//           );

//           if (selectedSrv) {
//             updateBooking({ selectedServices: [selectedSrv] });
//           }
//         }
//       }

//       // ✅ Pets - Use actual pets data instead of originalBooking.pet
//       if (pet && pets.length > 0) {
//         const actualPet = pets.find((p: Pet) => p.id === pet.id);
//         if (actualPet) {
//           updateBooking({ selectedPets: [actualPet] });
//         }
//       }

//       // ✅ Address - Use actual addresses data instead of originalBooking.address
//       if (address && addresses.length > 0) {
//         const actualAddress = addresses.find(
//           (addr: Address) => addr.id === address.id
//         );
//         if (actualAddress) {
//           updateBooking({ address: actualAddress });
//         }
//       }

//       // ✅ Pricing
//       if (service_pricing) updateBooking({ selectedPricing: service_pricing });

//       // ✅ Appointment slots
//       if (booking.appointment_time_slot) {
//         const date = new Date(booking.appointment_time_slot);
//         const formattedDate = date.toISOString().split('T')[0];
//         const formattedTime = date.toLocaleTimeString('en-US', {
//           hour: 'numeric',
//           minute: '2-digit',
//           hour12: true,
//         });

//         updateBooking({
//           slots: [{ date: formattedDate, time: formattedTime }],
//         });
//       }

//       // 👇 Notes
//       if (booking.notes) updateBooking({ notes: booking.notes });
//     }
//   }, [
//     isRescheduling,
//     originalBooking,
//     categoriesData,
//     categoriesLoading,
//     subCategoriesLoading,
//     subCategoriesData,
//     pets,
//     addresses,
//     petsLoading,
//     addressesLoading,
//   ]);

//   // const handleConfirmBooking = async () => {
//   //   if (!user || !bookingState) return;

//   //   setLoading(true);
//   //   setError('');

//   //   try {
//   //     // ⏱ format appointment slots
//   //     const appointment_time_slots =
//   //       bookingState.slots?.map(({ date, time }) => {
//   //         const localDate = new Date(`${date}T${convertTo24Hr(time)}:00+05:30`);
//   //         return localDate.toISOString();
//   //       }) || [];

//   //     // 🧾 calculate tax & totals
//   //     const tax = (bookingState?.selectedPricing?.discounted_price || 1) * 0.18;

//   //     const basePayload = {
//   //       pet_id: bookingState.selectedPets?.map((pet) => pet.id),
//   //       service_id: bookingState.selectedServices?.map((service) => service.id),
//   //       service_pricing_id: bookingState.selectedPricing?.id,
//   //       address_id: bookingState.address?.id,
//   //       appointment_time_slots: appointment_time_slots,
//   //       payment_method: 'COD',
//   //       amount: bookingState?.selectedPricing?.discounted_price,
//   //       tax,
//   //       total: (bookingState?.selectedPricing?.discounted_price || 1) + tax,
//   //       notes: bookingState.notes || '',
//   //       nature:
//   //         bookingState.nature ||
//   //         bookingState?.selectedPets?.[0]?.pet_details?.nature ||
//   //         '',
//   //       health_conditions:
//   //         bookingState.health_conditions ||
//   //         bookingState?.selectedPets?.[0]?.pet_details?.health_conditions ||
//   //         '',
//   //     };

//   //     let response;

//   //     if (isRescheduling && originalBooking?.booking.id) {
//   //       response = await axiosInstance.put(
//   //         `/bookings/update/${originalBooking?.booking.id}`,
//   //         basePayload
//   //       );
//   //       toast.success('Booking Updated Successfully');
//   //     } else {
//   //       response = await axiosInstance.post('/bookings/new', basePayload);
//   //       toast.success('Booking Successful');
//   //     }

//   //     // 👇 invalidate queries
//   //     await Promise.all([
//   //       queryClient.invalidateQueries({ queryKey: ['bookings'] }),
//   //       queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
//   //       queryClient.invalidateQueries({ queryKey: ['pets'] }),
//   //     ]);

//   //     if (response.status !== 200) {
//   //       throw new Error('Booking operation failed');
//   //     }

//   //     // 👇 keep your own redirect/reset
//   //     navigate('/history');
//   //     resetBooking();
//   //   } catch (err) {
//   //     console.error('Booking error:', err);
//   //     setError(
//   //       isRescheduling
//   //         ? 'Failed to update booking. Please try again.'
//   //         : 'Failed to create booking. Please try again.'
//   //     );
//   //     toast.error(
//   //       isRescheduling
//   //         ? 'Failed to update booking, please try again'
//   //         : 'Booking failed, please try again'
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleConfirmBooking = async () => {
//     if (!user || !bookingState) return;

//     setLoading(true);
//     setError('');

//     try {
//       const apiPayload = generateAPIPayload();

//       console.log('[v0] Generated API payload:', apiPayload);

//       let response;

//       if (isRescheduling && originalBooking?.booking.id) {
//         // For rescheduling, use the update endpoint
//         response = await axiosInstance.put(
//           `/bookings/update/${originalBooking?.booking.id}`,
//           {
//             ...apiPayload,
//             IsNew: false,
//             booking_id: originalBooking.booking.id,
//           }
//         );
//         toast.success('Booking Updated Successfully');
//       } else {
//         // For new bookings, use the save endpoint
//         response = await axiosInstance.post('/bookings/save', apiPayload);
//         toast.success('Booking Successful');
//       }

//       // 👇 invalidate queries
//       await Promise.all([
//         queryClient.invalidateQueries({ queryKey: ['bookings'] }),
//         queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
//         queryClient.invalidateQueries({ queryKey: ['pets'] }),
//       ]);

//       if (response.status !== 200) {
//         throw new Error('Booking operation failed');
//       }

//       // 👇 keep your own redirect/reset
//       navigate('/history');
//       resetBooking();
//     } catch (err) {
//       console.error('Booking error:', err);
//       setError(
//         isRescheduling
//           ? 'Failed to update booking. Please try again.'
//           : 'Failed to create booking. Please try again.'
//       );
//       toast.error(
//         isRescheduling
//           ? 'Failed to update booking, please try again'
//           : 'Booking failed, please try again'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="max-w-4xl mx-auto">
//       <BookingProgress currentStep={currentStep} steps={steps} />

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
//           {error}
//         </div>
//       )}

//       {(categoriesError ||
//         subCategoriesError ||
//         petsError ||
//         addressesError) && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
//           Failed to load data. Please try again.
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 min-h-[500px]">
//         {currentStep === 1 && !categoriesLoading && (
//           <CategoryStep
//             categories={categoriesData?.data || []}
//             selectedCategory={selectedCategory}
//             onCategorySelect={handleCategorySelect}
//             isLoading={
//               categoriesLoading ||
//               subCategoriesLoading ||
//               petsLoading ||
//               addressesLoading
//             }
//           />
//         )}

//         {currentStep === 2 && !subCategoriesLoading && (
//           <MultiServiceStep
//             subCategoriesData={subCategoriesData?.data || []}
//             selectedServices={bookingState.selectedServices || []}
//             searchQuery={searchQuery}
//             priceFilter={priceFilter}
//             onSearchChange={setSearchQuery}
//             onPriceFilterChange={setPriceFilter}
//             onServiceToggle={handleServiceToggle}
//             onResetPriceFilter={() => setPriceFilter({ min: 0, max: 5000 })}
//             isLoading={subCategoriesLoading}
//           />
//         )}

//         {currentStep === 3 && (
//           <MultiPetStep
//             pets={pets}
//             selectedPets={bookingState.selectedPets || []}
//             onPetToggle={handlePetToggle}
//             onShowAddPet={() => setShowAddPet(true)}
//             onHideAddPet={() => setShowAddPet(false)}
//             showAddPet={showAddPet}
//             loading={petsLoading}
//           />
//         )}

//         {currentStep === 4 && (
//           <ServicePetConnectionStep
//             selectedServices={bookingState.selectedServices || []}
//             selectedPets={bookingState.selectedPets || []}
//             connections={bookingState.connections || []}
//             onAddConnection={addServicePetConnection}
//             onRemoveConnection={removeServicePetConnection}
//             onUpdateConnection={updateServicePetConnection}
//           />
//         )}

//         {currentStep === 5 && (
//           <LocationStep
//             selectedAddress={bookingState.address || null}
//             showAddAddress={showAddAddress}
//             loading={loading}
//             onSelectAddress={(address) => updateBooking({ address })}
//             onShowAddAddress={() => setShowAddAddress(true)}
//             onHideAddAddress={() => setShowAddAddress(false)}
//           />
//         )}

//         {/* {currentStep === 6 && (
//           <MultiScheduleStep
//             connections={bookingState.connections || []}
//             onUpdateConnection={updateServicePetConnection}
//             isRescheduling={isRescheduling}
//           />
//         )} */}
//         {currentStep === 6 && (
//           <ScheduleStep
//             isRescheduling={isRescheduling}
//             slots={bookingState.slots || []}
//             onAddSlot={(slot) =>
//               updateBooking({ slots: [...(bookingState.slots || []), slot] })
//             }
//             onRemoveSlot={(index) =>
//               updateBooking({
//                 slots: bookingState.slots?.filter((_, i) => i !== index) || [],
//               })
//             }
//           />
//         )}

//         {/* {currentStep === 7 && (
//           <ConfirmationStep
//             bookingDetails={bookingState}
//             updateBooking={updateBooking}
//             onConfirm={handleConfirmBooking}
//             loading={loading}
//           />
//         )} */}
//         {currentStep === 7 && (
//           <MultiConfirmationStep
//             bookingDetails={bookingState}
//             updateBooking={updateBooking}
//             onConfirm={handleConfirmBooking}
//             loading={loading}
//           />
//         )}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex items-center justify-between mt-8">
//         <button
//           onClick={handleBack}
//           disabled={currentStep === 1 || loading}
//           className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ArrowLeft className="h-5 w-5" />
//           <span>Back</span>
//         </button>

//         {currentStep === steps.length ? null : (
//           <button
//             onClick={handleNext}
//             disabled={!canProceed()}
//             className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <span>Next</span>
//             <ArrowRight className="h-5 w-5" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Booking;

