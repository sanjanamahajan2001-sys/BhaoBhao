'use client';

import type React from 'react';
import { Calendar, Clock, DogIcon, MapPin } from 'lucide-react';
import type { BookingDetails } from '@/types/booking.type';
import { formatPrettyDate } from '../ScheduleStep';
import { getImageUrl } from '@/utils/imageUtils';

interface ConfirmationStepProps {
  bookingDetails: BookingDetails;
  onConfirm: () => void;
  loading: boolean;
  updateBooking: (updates: Partial<BookingDetails>) => void;
}

const MultiConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingDetails,
  onConfirm,
  loading,
  updateBooking,
}) => {
  const { connections = [], address, notes, slots = [] } = bookingDetails;

  const calculateTotals = () => {
    const inclusiveTotal = connections.reduce((total, connection) => {
      const price =
        connection.selectedPricing?.discounted_price ||
        connection.selectedPricing?.mrp ||
        0;
      return total + price;
    }, 0);

    const taxRate = 0.18;
    const basePrice = inclusiveTotal / (1 + taxRate); // NOTE: Display-only base (minus 18%).
    const taxAmount = inclusiveTotal - basePrice; // NOTE: Display-only tax portion.
    const finalTotal = inclusiveTotal; // NOTE: Keep total as inclusive price.

    return { basePrice, taxAmount, finalTotal, taxRate };
  };

  const { basePrice, taxAmount, finalTotal, taxRate } = calculateTotals();

  const formatCurrency = (value: number) => {
    const roundedValue = Math.round(value * 100) / 100; // NOTE: Display-only rounding for confirmation prices.
    return `₹ ${roundedValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2, // NOTE: Keep decimals visible on confirmation screen.
      maximumFractionDigits: 2, // NOTE: Keep decimals visible on confirmation screen.
    })}`;
  };

  // Get unique pets from connections
  const uniquePets = connections.reduce((acc, connection) => {
    if (!acc.find((pet) => pet.id === connection.pet.id)) {
      acc.push(connection.pet);
    }
    return acc;
  }, [] as (typeof connections)[0]['pet'][]);

  // Get services grouped by pet
  const getServicesForPet = (petId: number) => {
    return connections.filter((conn) => conn.pet.id === petId);
  };

  // Update pet details for all connections with that pet
  const updatePetDetails = (
    petId: number,
    field: 'nature' | 'health_conditions',
    value: string
  ) => {
    const updatedConnections = connections.map((conn) =>
      conn.pet.id === petId
        ? {
            ...conn,
            pet: {
              ...conn.pet,
              pet_details: {
                ...conn.pet.pet_details,
                [field]: value,
              },
            },
          }
        : conn
    );
    updateBooking({ connections: updatedConnections });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Review Your Booking
      </h2>

      {/* Schedule & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schedule */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Scheduled Time
          </h3>
          {slots.length > 0 ? (
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/60 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {formatPrettyDate(slot.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>{slot.time}</span>
                    </div>
                  </div>
                  {index === 0 && slots.length === 1 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              {slots.length > 1 && (
                <p className="text-xs text-gray-600 mt-2">
                  {slots.length} time slots selected
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No schedule selected</p>
          )}
        </div>

        {/* Location */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Service Location
          </h3>
          {address ? (
            <div className="bg-white/60 rounded-lg p-3">
              <p className="font-medium text-gray-900">{address.label}</p>
              <p className="text-gray-600 text-sm mt-1">
                {address.flat_no && `${address.flat_no}, `}
                {address.apartment_name && `${address.apartment_name}, `}
                {address.full_address}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pincode: {address.pincode}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No address selected</p>
          )}
        </div>
      </div>

      {/* Pets Section */}
      {uniquePets.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Your Pets & Their Services
          </h3>
          {uniquePets.map((pet) => {
            const petServices = getServicesForPet(pet.id);
            const petTotal = petServices.reduce(
              (sum, conn) =>
                sum + (conn.selectedPricing?.discounted_price || 0),
              0
            );

            return (
              <div
                key={pet.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
              >
                {/* Pet Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl flex-shrink-0">
                      {pet.photo_url?.length ? (
                        <img
                          src={getImageUrl(pet.photo_url[0])}
                          alt={pet.pet_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center rounded-xl">
                          <span className="text-white font-bold text-lg">
                            {pet.pet_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {pet.pet_name}
                      </h4>
                      <p className="text-gray-600">
                        {pet.pet_type_obj?.name} •{' '}
                        {pet.pet_breed_obj?.breed_name}
                      </p>
                      <p className="text-sm text-purple-600 font-medium mt-1">
                        {petServices.length} service
                        {petServices.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(petTotal / (1 + taxRate))}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total for {pet.pet_name}
                    </p>
                  </div>
                </div>

                {/* Services for this pet */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Services:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {petServices.map((connection) => (
                      <div
                        key={connection.id}
                        className="bg-white/70 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {connection.service.photos?.[0] && (
                            <img
                              src={getImageUrl(connection.service.photos[0], 'services')}
                              alt={connection.service.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {connection.service.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {connection.service.durationMinutes} mins
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-purple-600 text-sm">
                          {formatCurrency(
                            (connection.selectedPricing?.discounted_price ||
                              connection.selectedPricing?.mrp ||
                              0) /
                              (1 + taxRate)
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pet Details - Only once per pet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {pet.pet_name}'s Nature
                    </label>
                    <input
                      type="text"
                      value={pet.pet_details?.nature || ''}
                      onChange={(e) =>
                        updatePetDetails(pet.id, 'nature', e.target.value)
                      }
                      placeholder={`e.g. "${pet.pet_name} is calm and friendly"`}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Conditions
                    </label>
                    <input
                      type="text"
                      value={pet.pet_details?.health_conditions || ''}
                      onChange={(e) =>
                        updatePetDetails(
                          pet.id,
                          'health_conditions',
                          e.target.value
                        )
                      }
                      placeholder={`Any health issues for ${pet.pet_name}?`}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <DogIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pets selected</p>
        </div>
      )}

      {/* General Notes */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
        <textarea
          value={notes || ''}
          onChange={(e) => updateBooking({ notes: e.target.value })}
          placeholder="Any special instructions or requests for the groomer..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Price Breakdown */}
      <div className="bg-gradient-to-br from-teal-50 to-purple-50 rounded-xl p-6 border border-teal-100">
        <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>

        <div className="space-y-3">
          {/* Services by Pet */}
          {uniquePets.map((pet) => {
            const petServices = getServicesForPet(pet.id);
            const petTotal = petServices.reduce(
              (sum, conn) =>
                sum + (conn.selectedPricing?.discounted_price || 0),
              0
            );

            return (
              <div
                key={pet.id}
                className="border-b border-gray-200 pb-3 last:border-b-0"
              >
                <div className="flex justify-between items-center font-medium text-gray-900 mb-2">
                  <span>{pet.pet_name}</span>
                  <span>{formatCurrency(petTotal / (1 + taxRate))}</span>
                </div>
                {petServices.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex justify-between items-center text-sm text-gray-600 ml-4"
                  >
                    <span>• {connection.service.name}</span>
                    <span>
                      {formatCurrency(
                        (connection.selectedPricing?.discounted_price ||
                          connection.selectedPricing?.mrp ||
                          0) /
                          (1 + taxRate)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                Subtotal ({connections.length} services)
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(basePrice)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Tax (GST @ 18%)</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(taxAmount)}
            </span>
          </div>

          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-teal-600">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        disabled={loading || connections.length === 0}
        className="w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Confirming...'
          : `Confirm Booking • ${formatCurrency(finalTotal)}`}
      </button>
    </div>
  );
};

export default MultiConfirmationStep;
