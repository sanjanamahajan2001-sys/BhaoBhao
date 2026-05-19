'use client';

import type React from 'react';
import { useState } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import type {
  SubCategoryWithServices,
  ServiceWithPricing,
} from '@/types/booking.type';
import { getImageUrl } from '@/utils/imageUtils';

interface MultiServiceStepProps {
  subCategoriesData: SubCategoryWithServices[];
  selectedServices: ServiceWithPricing[];
  searchQuery: string;
  priceFilter: { min: number; max: number };
  onSearchChange: (query: string) => void;
  onPriceFilterChange: (filter: { min: number; max: number }) => void;
  onServiceToggle: (service: ServiceWithPricing) => void;
  onResetPriceFilter: () => void;
  isLoading?: boolean;
}

const MultiServiceStep: React.FC<MultiServiceStepProps> = ({
  subCategoriesData,
  selectedServices,
  searchQuery,
  priceFilter,
  onSearchChange,
  onPriceFilterChange,
  onServiceToggle,
  onResetPriceFilter,
  isLoading = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getMaxPrice = (pricing: any[]) => {
    return pricing.reduce((max, current) =>
      current.discounted_price > max.discounted_price ? current : max
    );
  };

  const filteredSubCategories = subCategoriesData
    .map((subCat) => ({
      ...subCat,
      services: subCat.services.filter((service) => {
        const matchesSearch =
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.smallDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const maxPrice = getMaxPrice(service.pricing);
        const matchesPrice =
          maxPrice.discounted_price >= priceFilter.min &&
          maxPrice.discounted_price <= priceFilter.max;

        return matchesSearch && matchesPrice;
      }),
    }))
    .filter((subCat) => subCat.services.length > 0);

  const isServiceSelected = (service: ServiceWithPricing) =>
    selectedServices.some((s) => s.id === service.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Services
        </h2>
        <p className="text-gray-600">Choose multiple services for your pets</p>
        {selectedServices.length > 0 && (
          <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
            {selectedServices.length} service
            {selectedServices.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Price Filter */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <h3 className="font-medium">Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Min Price</label>
                <input
                  type="number"
                  value={priceFilter.min}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      min: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">Max Price</label>
                <input
                  type="number"
                  value={priceFilter.max}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      max: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={onResetPriceFilter}
                className="mt-6 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services */}
      <div className="space-y-8">
        {filteredSubCategories.map((subCategory) => (
          <div key={subCategory.id} className="space-y-4">
            {/* Subcategory Header */}
            <div className="flex items-center gap-3">
              <img
                src={getImageUrl(subCategory.photos[0], 'subCategories')}
                alt={subCategory.sub_category_name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {subCategory.sub_category_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {subCategory.description}
                </p>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subCategory.services.map((service) => {
                const maxPrice = getMaxPrice(service.pricing);
                const selected = isServiceSelected(service);

                return (
                  <div
                    key={service.id}
                    onClick={() => onServiceToggle(service)}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected ? 'ring-2 ring-teal-500 bg-teal-50' : 'bg-white'
                    }`}
                  >
                    {selected && (
                      <div className="absolute -top-2 -right-2 bg-teal-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    <img
                      src={getImageUrl(service.photos[0], 'services')}
                      alt={service.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />

                    <h4 className="font-medium text-gray-900 mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.smallDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-teal-600">
                          ₹{maxPrice.discounted_price}
                        </span>
                        {maxPrice.mrp > maxPrice.discounted_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{maxPrice.mrp}
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                        {service.durationMinutes}min
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {maxPrice.pet_size} • {maxPrice.groomer_level}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredSubCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No services found matching your criteria.
          </p>
          <button
            onClick={onResetPriceFilter}
            className="mt-4 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiServiceStep;
