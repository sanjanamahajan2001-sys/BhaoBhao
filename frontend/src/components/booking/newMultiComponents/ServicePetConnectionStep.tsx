'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { ShoppingCart, Check, X, DogIcon, Clock, Star } from 'lucide-react';
import type {
  ServiceWithPricing,
  Pets,
  ServicePetConnection,
} from '@/types/booking.type';
import { getImageUrl } from '@/utils/imageUtils';

interface ServicePetConnectionStepProps {
  selectedServices: ServiceWithPricing[];
  selectedPets: Pets[];
  connections: ServicePetConnection[];
  onAddConnection: (service: ServiceWithPricing, pet: Pets) => void;
  onRemoveConnection: (connectionId: string) => void;
  onUpdateConnection: (
    connectionId: string,
    updates: Partial<ServicePetConnection>
  ) => void;
}

interface ServicePetSelection {
  [serviceId: number]: {
    [petId: number]: boolean;
  };
}

const ServicePetConnectionStep: React.FC<ServicePetConnectionStepProps> = ({
  selectedServices,
  selectedPets,
  connections,
  onAddConnection,
  onRemoveConnection,
  onUpdateConnection,
}) => {
  const [servicePetSelections, setServicePetSelections] =
    useState<ServicePetSelection>({});

  // Initialize selections based on existing connections
  useEffect(() => {
    const selections: ServicePetSelection = {};

    selectedServices.forEach((service) => {
      selections[service.id] = {};
      selectedPets.forEach((pet) => {
        const connectionExists = connections.some(
          (conn) => conn.service.id === service.id && conn.pet.id === pet.id
        );
        selections[service.id][pet.id] = connectionExists;
      });
    });

    setServicePetSelections(selections);
  }, [selectedServices, selectedPets, connections]);

  // Handle pet selection for a service
  const handlePetToggle = (service: ServiceWithPricing, pet: Pets) => {
    const connectionId = `${service.id}-${pet.id}`;
    const isCurrentlySelected =
      servicePetSelections[service.id]?.[pet.id] || false;

    // Update local state
    setServicePetSelections((prev) => ({
      ...prev,
      [service.id]: {
        ...prev[service.id],
        [pet.id]: !isCurrentlySelected,
      },
    }));

    // Update connections
    if (isCurrentlySelected) {
      onRemoveConnection(connectionId);
    } else {
      onAddConnection(service, pet);
    }
  };

  // Select all pets for a service
  const handleSelectAllPets = (service: ServiceWithPricing) => {
    const allSelected = selectedPets.every(
      (pet) => servicePetSelections[service.id]?.[pet.id] || false
    );

    selectedPets.forEach((pet) => {
      const connectionId = `${service.id}-${pet.id}`;
      const isCurrentlySelected =
        servicePetSelections[service.id]?.[pet.id] || false;

      if (allSelected && isCurrentlySelected) {
        onRemoveConnection(connectionId);
      } else if (!allSelected && !isCurrentlySelected) {
        onAddConnection(service, pet);
      }
    });
  };

  // Get stats for a service
  const getServiceStats = (service: ServiceWithPricing) => {
    const selectedCount = selectedPets.filter(
      (pet) => servicePetSelections[service.id]?.[pet.id] || false
    ).length;
    const totalPrice =
      selectedCount * (service.pricing[0]?.discounted_price || 0);
    const totalDuration = selectedCount * service.durationMinutes;

    return { selectedCount, totalPrice, totalDuration };
  };

  // Get total stats
  const getTotalStats = () => {
    let totalConnections = 0;
    let totalPrice = 0;
    let totalDuration = 0;

    selectedServices.forEach((service) => {
      const stats = getServiceStats(service);
      totalConnections += stats.selectedCount;
      totalPrice += stats.totalPrice;
      totalDuration += stats.totalDuration;
    });

    return { totalConnections, totalPrice, totalDuration };
  };

  if (selectedServices.length === 0 || selectedPets.length === 0) {
    return (
      <div className="space-y-6 text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">
          Connect Services to Pets
        </h2>
        <p className="text-gray-600">
          {selectedServices.length === 0 && selectedPets.length === 0
            ? 'Select services and pets to create your booking cart'
            : selectedServices.length === 0
            ? 'Select services to continue'
            : 'Select pets to continue'}
        </p>
      </div>
    );
  }

  const { totalConnections, totalPrice, totalDuration } = getTotalStats();

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Cart</h2>
        <p className="text-gray-600 mb-4">
          Select which pets need each service
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <span className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full font-medium">
            {totalConnections} bookings
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
            ₹{totalPrice.toLocaleString()}
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
            {totalDuration} mins total
          </span>
        </div>
      </div>

      {/* Service Cards */}
      <div className="space-y-6">
        {selectedServices.map((service) => {
          const stats = getServiceStats(service);
          const allPetsSelected =
            selectedPets.length > 0 &&
            selectedPets.every(
              (pet) => servicePetSelections[service.id]?.[pet.id] || false
            );

          return (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Service Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  {service.photos?.[0] && (
                    <img
                      src={getImageUrl(service.photos[0], 'services')}
                      alt={service.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {service.smallDescription}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.durationMinutes} mins
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />₹
                        {service.pricing[0]?.discounted_price || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Stats */}
                <div className="text-right">
                  <div className="text-lg font-bold text-teal-600">
                    ₹{stats.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.selectedCount} of {selectedPets.length} pets
                  </div>
                </div>
              </div>

              {/* Pet Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Select pets for this service:
                  </h4>
                  <button
                    onClick={() => handleSelectAllPets(service)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      allPetsSelected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    }`}
                  >
                    {allPetsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedPets.map((pet) => {
                    const isSelected =
                      servicePetSelections[service.id]?.[pet.id] || false;
                    const individualPrice =
                      service.pricing[0]?.discounted_price || 0;

                    return (
                      <div
                        key={pet.id}
                        onClick={() => handlePetToggle(service, pet)}
                        className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {/* Selection Indicator */}
                        <div
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-teal-500' : 'bg-gray-200'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Pet Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg flex-shrink-0">
                            {pet.photo_url?.length ? (
                              <img
                                src={getImageUrl(pet.photo_url[0])}
                                alt={pet.pet_name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center rounded-lg">
                                <span className="text-white font-bold text-sm">
                                  {pet.pet_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {pet.pet_name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {pet.pet_type_obj?.name} •{' '}
                              {pet.pet_breed_obj?.breed_name}
                            </p>
                            {isSelected && (
                              <p className="text-xs text-teal-600 font-medium mt-1">
                                ₹{individualPrice}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Booking Summary
            </h3>
            <p className="text-sm text-gray-600">
              {totalConnections} service{totalConnections !== 1 ? 's' : ''}{' '}
              across {selectedServices.length} categor
              {selectedServices.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-600">
              ₹{totalPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Total: {totalDuration} mins
            </div>
          </div>
        </div>

        {totalConnections > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {connections.map((connection, index) => (
                <span
                  key={connection.id}
                  className="inline-flex items-center px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border"
                >
                  {connection.service.name} → {connection.pet.pet_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalConnections === 0 && (
        <div className="text-center py-8">
          <DogIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No services selected
          </h3>
          <p className="text-gray-600">
            Choose which pets need each service to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicePetConnectionStep;
