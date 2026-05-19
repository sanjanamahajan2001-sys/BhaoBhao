import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Filter, X, DogIcon } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { PricingOption, Service } from '@/types/booking.type';
import { getImageUrl } from '@/utils/imageUtils';

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
  is_addon?: boolean;
}

interface SubCategoryWithServices {
  id: number;
  sub_category_name: string;
  photos: string[];
  description: string;
  services: ServiceWithPricing[];
}

interface ServiceStepProps {
  searchQuery: string;
  priceFilter: { min: number; max: number };
  selectedService: Service | null;
  subCategoriesData: SubCategoryWithServices[];
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onPriceFilterChange: (filter: { min: number; max: number }) => void;
  onServiceSelect: (
    service: Service,
    subCategory: SubCategoryWithServices
  ) => void;
  onResetPriceFilter: () => void;
}
export const formatPrice = (price: number) => {
  const roundedPrice = Math.round(price); // NOTE: Display-only rounding for Step 1 pricing.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // NOTE: Display-only, no decimals for Step 1 prices.
  }).format(roundedPrice);
};
const ServiceStep: React.FC<ServiceStepProps> = ({
  searchQuery,
  priceFilter,
  selectedService: selectedServiceProp,
  subCategoriesData,
  isLoading,
  onSearchChange,
  onPriceFilterChange,
  onServiceSelect,
  onResetPriceFilter,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  // inside ServiceStep
  const { bookingState, updateBooking } = useBooking();

  // ✅ Use bookingState.service as the source of truth, fallback to prop
  // This ensures we always have the latest value from context
  const selectedService = bookingState?.service || selectedServiceProp;

  // Get all services with their subcategory info
  const allServices = useMemo(() => {
    if (!subCategoriesData) {
      return [];
    }
    return subCategoriesData.flatMap((subCategory) =>
      subCategory.services
        // Filter out add-ons
        .filter((service) => service && service.is_addon === false)
        .map((service) => {
          // Robust price calculation
          const prices = (service.pricing || [])
            .map((p) => p.discounted_price)
            .filter((p) => p != null) as number[];

          return {
            ...service,
            subCategory: subCategory,
            minPrice: prices.length > 0 ? Math.min(...prices) : Infinity,
            maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          };
        })
    );
  }, [subCategoriesData]);

  // Filter services based on search and price
  const filteredServices = useMemo(() => {
    const query = (searchQuery || '').toLowerCase();

    return allServices.filter((service) => {
      // Use optional chaining (?.) for safe searching
      const matchesSearch =
        service.name?.toLowerCase().includes(query) ||
        service.smallDescription?.toLowerCase().includes(query) ||
        service.subCategory.sub_category_name?.toLowerCase().includes(query);

      const matchesPrice =
        service.minPrice >= priceFilter.min &&
        service.minPrice <= priceFilter.max;

      return matchesSearch && matchesPrice;
    });
  }, [allServices, searchQuery, priceFilter]);

  // Group filtered services by subcategory
  const groupedServices = useMemo(() => {
    const groups: {
      [key: number]: { subCategory: SubCategoryWithServices; services: any[] };
    } = {};

    filteredServices.forEach((service) => {
      if (!groups[service.subCategory.id]) {
        groups[service.subCategory.id] = {
          subCategory: service.subCategory,
          services: [],
        };
      }
      groups[service.subCategory.id].services.push(service);
    });

    return Object.values(groups);
  }, [filteredServices]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Service
        </h2>
        <p className="text-gray-600 max-sm:hidden">
          Select the perfect service for your pet
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        {/* // TODO ADD LATER */}
        <div className="  items-center justify-between hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {(priceFilter.min > 0 || priceFilter.max < 5000) && (
            <button
              onClick={onResetPriceFilter}
              className="flex items-center space-x-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceFilter.min || ''}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      min: Number(e.target.value) || 0,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceFilter.max || ''}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      max: Number(e.target.value) || 5000,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====== START: UPDATED CONDITIONAL LOGIC ====== */}

      {/* 1. Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          {/* Simple spinner */}
          <svg
            className="animate-spin h-8 w-8 text-teal-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            Loading services...
          </h3>
        </div>
      ) :

      /* 2. No Results Found (Filtered or Empty) */
      filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find more services.
          </p>
        </div>
      ) :

      /* 3. Services Found (List View) */
      (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const subCategory = service.subCategory;
                  // Find the pricing option with the largest discounted price
                  const highestPricing = service.pricing.reduce(
                    (prev: any, curr: any) =>
                      curr.discounted_price > prev.discounted_price ? curr : prev
                  );

                  return (
                    <div
                      key={service.id}
                      className={`
        relative p-6 pb-10 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
        ${
          selectedService?.id === service.id
            ? 'border-teal-500 bg-teal-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-teal-300'
        }
      `}
                      onClick={() => {
                        onServiceSelect(service, subCategory);
                        updateBooking({ selectedPricing: highestPricing });
                      }}
                    >
                      {/* Service Image */}
                      {service.photos && Array.isArray(service.photos) && service.photos.length > 0 && service.photos[0] ? (
                        <div className="mb-4">
                          <img
                            src={getImageUrl(String(service.photos[0]), 'services')}
                            alt={service.name}
                            className="w-full h-40 object-cover rounded-lg"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <DogIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}

                      {/* Selection Indicator - Positioned first to avoid overlap */}
                      {selectedService?.id === service.id && (
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

                      {/* Service Info */}
                      <div className="space-y-3">
                        <div>
                          <h4
                            className={`
                                      font-semibold text-lg mb-2 ${selectedService?.id === service.id ? 'pr-10' : ''}
                                      ${
                                        selectedService?.id === service.id
                                          ? 'text-teal-900'
                                          : 'text-gray-900'
                                      }
                                    `}
                          >
                            {service.name}
                          </h4>
                          <p
                            className={`
                                          text-sm leading-relaxed
                                          ${
                                            selectedService?.id === service.id
                                              ? 'text-teal-700'
                                              : 'text-gray-600'
                                          }
                                        `}
                          >
                            {service.smallDescription}
                          </p>
                        </div>

                        {/* Rating and Duration */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            {/* <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-gray-500">
                            ({service.totalRatings.toLocaleString()})
                          </span>
                          */}
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              Approx. {formatDuration(service.durationMinutes)}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          {highestPricing.mrp >
                            highestPricing.discounted_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(highestPricing.mrp)}
                            </span>
                          )}
                          <span className="text-lg font-semibold text-green-600">
                            {formatPrice(highestPricing.discounted_price)}
                          </span>
                        </div>
                        {/* NOTE: Added tax-inclusive label per client request. */}
                        {/* NOTE: Positioned bottom-right within the card. */}
                        <p className="absolute bottom-3 right-4 text-xs text-gray-500">
                          Price inclusive of taxes
                        </p>

                        {/* Pet Types */}
                        {/* <div className="flex flex-wrap gap-1">
                        {service.petType
                          .slice(0, 3)
                          .map((type: string, index: number) => (
                            <span
                              key={index}
                              className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${selectedService?.id === service.id
                                  ? 'bg-teal-200 text-teal-800'
                                  : 'bg-gray-100 text-gray-700'
                                }
              `}
                            >
                              {type}
                            </span>
                          ))}
                        {service.petType.length > 3 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            +{service.petType.length - 3} more
                          </span>
                        )}
                      </div>
                      */}
                      </div>

                      {/* CHAT BUTTON HAS BEEN MOVED OUTSIDE THE LOOP
                      */}
                    </div>
                  );
                })}
        </div>
      )}
      {/* ====== END: UPDATED CONDITIONAL LOGIC ====== */}

      {/* ✨ MOVED HERE: The chat button is now outside the loops */}
      <a
        href="https://wa.me/7900118109"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-4 sm:right-6 bg-green-500 hover:bg-green-600 text-white font-semibold p-3 sm:px-4 sm:py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300"
      >
        {/* Updated WhatsApp Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M16.75 13.99c-.1-.06-1.11-.55-1.28-.61-.17-.06-.29-.09-.42.09-.12.18-.48.61-.59.73-.11.12-.22.14-.4.06-.18-.09-.75-.28-1.43-.88-.53-.47-.88-.94-1-1.39-.11-.45.11-.69.17-.76.06-.06.12-.11.18-.17.06-.06.09-.12.14-.2.05-.09.02-.17 0-.23-.02-.06-.42-1.01-.57-1.38-.15-.36-.3-.31-.42-.31-.11 0-.23-.02-.35-.02-.12 0-.31.05-.47.23-.16.18-.61.59-.61 1.44 0 .85.62 1.67.71 1.79.09.12 1.21 1.84 2.94 2.59.24.11.43.17.6.22.3.06.56.05.76-.03.22-.09.74-.3 1.05-.59.31-.29.31-.53.21-.59l-.01-.01z M12.02 2.02c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.45 1.26 4.9L2 22l5.3-1.38c1.4.79 2.97 1.26 4.67 1.26h.01c5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.28c-1.5 0-2.96-.36-4.29-1.02L3.8 20.7l1.45-3.99c-.73-1.37-1.12-2.92-1.12-4.55 0-4.59 3.73-8.32 8.32-8.32s8.32 3.73 8.32 8.32-3.73 8.32-8.32 8.32z" />
        </svg>
        {/* Responsive text span (hidden on mobile) */}
        <span className="hidden sm:inline">Chat with us</span>
      </a>
    </div>
  );
};

export default ServiceStep;
