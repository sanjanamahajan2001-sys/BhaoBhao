'use client';

import React from 'react';
import { Calendar, Clock, DogIcon, MapPin, PlusCircle } from 'lucide-react';
import { BookingDetails, Pets } from '@/types/booking.type'; // Assuming Pets is in booking.type
import { formatPrettyDate } from './ScheduleStep';
import { getImageUrl } from '@/utils/imageUtils';

// Define a minimal Pet type if not already globally available
// This should ideally match the one in `booking.type.ts`
interface PetForConfirmation extends Pets {
  pet_pic_url?: string; // 👈 Ensure this property exists
  // other properties from Pets...
}
interface ConfirmationStepProps {
  bookingDetails: BookingDetails & { pets?: PetForConfirmation[] }; // Use updated type
  onConfirm: () => void;
  loading: boolean;
  updateBooking: (updates: Partial<BookingDetails>) => void;
  goToStep: (stepNumber: number) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingDetails,
  onConfirm,
  loading,
  updateBooking,
  goToStep,
}) => {
  const {
    service,
    category,
    pets = [],
    address,
    slots = [],
    selectedPricing,
    notes,
    selectedAddons = [],
  } = bookingDetails;

  const pricePerPet =
    selectedPricing?.discounted_price || selectedPricing?.mrp || 0;

  // ✅ This calculation is correct as long as slots.length is 1
  const basePrice = pricePerPet * slots.length;

  // ✅ Calculate Add-on total (with fallback for missing prices)
  const addonTotal =
    bookingDetails.selectedAddons?.reduce(
      (sum, addon) => sum + (addon.price || 0),
      0
    ) || 0;

  const inclusiveSubtotal = basePrice + addonTotal; // NOTE: Prices are tax-inclusive.
  const taxRate = 0.18;
  const baseSubtotal = inclusiveSubtotal / (1 + taxRate); // NOTE: Display-only base (minus 18%).
  const taxAmount = inclusiveSubtotal - baseSubtotal; // NOTE: Display-only tax portion.
  const finalTotal = inclusiveSubtotal; // NOTE: Keep total as inclusive price.

  const formatCurrency = (value: number) => {
    const roundedValue = Math.round(value * 100) / 100; // NOTE: Display-only rounding for confirmation prices.
    return `₹ ${roundedValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2, // NOTE: Keep decimals visible on confirmation screen.
      maximumFractionDigits: 2, // NOTE: Keep decimals visible on confirmation screen.
    })}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Review Your Booking
      </h2>

      {/* Schedule & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schedule */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" /> Scheduled Time
            </div>
            <button
              onClick={() => goToStep(6)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          </h3>
          {slots.length > 0 ? (
            <div className="space-y-2">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No schedule selected</p>
          )}
        </div>

        {/* Location */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" /> Service Location
            </div>
            <button
              onClick={() => goToStep(5)}
              className="text-sm text-green-600 hover:underline"
            >
              Edit
            </button>
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

      {/* Selected Package */}
      {service && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Selected Package</h3>
            <button
              onClick={() => goToStep(2)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit Package
            </button>
          </div>

          <div className="text-gray-700">
            <p className="font-medium">{service.name}</p>
            <p className="text-gray-600 text-sm">{service.smallDescription}</p>
            <p className="text-xs text-gray-500 mt-1">
              Duration: {service.durationMinutes} mins
            </p>
          </div>

          {selectedAddons.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <PlusCircle className="h-4 w-4 mr-1 text-green-600" /> Add-ons
                </h4>
                <button
                  onClick={() => goToStep(3)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Edit Add-ons
                </button>
              </div>

              <ul className="space-y-1 text-sm text-gray-700">
                {selectedAddons.map((addon, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{addon.name}</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(addon.price || 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Pets */}
      {pets.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>Your Pets</span>
            <button
              onClick={() => goToStep(4)}
              className="text-sm text-teal-600 hover:underline"
            >
              Edit
            </button>
          </h3>
          {pets.map((pet, idx) => (
            <div
              key={pet.id}
              className="bg-white/70 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl flex-shrink-0">
                    {/* ✅ **FIXED: Use pet_pic_url (string) not photo_url (array)** */}
                    {pet.pet_pic_url ? (
                      <img
                        src={getImageUrl(pet.pet_pic_url)}
                        alt={pet.pet_name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
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
                      {pet.pet_type_obj?.name} • {pet.pet_breed_obj?.breed_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nature
                  </label>
                  <input
                    type="text"
                    // ✅ **FIX 1: Check both pet_details.nature AND pet.nature**
                    value={pet?.pet_details?.nature || pet?.nature || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const updatedPets = [...pets];
                      // ✅ **FIX 2: Write to both locations to ensure consistency**
                      updatedPets[idx] = {
                        ...pet,
                        nature: newValue, // Write to root
                        pet_details: {
                          ...pet.pet_details,
                          nature: newValue, // Write to nested
                        },
                      };
                      updateBooking({ pets: updatedPets });
                    }}
                    placeholder={`e.g. "${pet.pet_name} is calm"`}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Conditions
                  </label>
                  <input
                    type="text"
                    // ✅ **FIX 3: Check both pet_details.health_conditions AND pet.health_conditions**
                    value={
                      pet?.pet_details?.health_conditions ||
                      pet?.health_conditions ||
                      ''
                    }
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const updatedPets = [...pets];
                      // ✅ **FIX 4: Write to both locations to ensure consistency**
                      updatedPets[idx] = {
                        ...pet,
                        health_conditions: newValue, // Write to root
                        pet_details: {
                          ...pet.pet_details,
                          health_conditions: newValue, // Write to nested
                        },
                      };
                      updateBooking({ pets: updatedPets });
                    }}
                    placeholder={`Any health issues for ${pet.pet_name}?`}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <DogIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pets selected</p>
        </div>
      )}

      {/* Notes */}
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

      {/* ✅ Price Breakdown */}
      <div className="bg-gradient-to-br from-teal-50 to-purple-50 rounded-xl p-6 border border-teal-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span>Price Breakdown</span>
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center font-medium text-gray-900">
            <span>
              Service Price
              {slots.length > 1 &&
                `(${formatCurrency(pricePerPet)} × ${slots.length})`}
            </span>
            <span>{formatCurrency(basePrice / (1 + taxRate))}</span>
          </div>

          {/* ================================================================== */}
          {/* ✅ START: MODIFIED ADD-ON LOGIC */}
          {/* ================================================================== */}
          {bookingDetails.selectedAddons &&
            bookingDetails.selectedAddons.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm text-gray-700 font-medium">
                  <span>
                    {/* ✅ RULE APPLIED: Show name if 1, count if > 1 */}
                    {bookingDetails.selectedAddons.length === 1
                      ? `Add-on: ${bookingDetails.selectedAddons[0].name}`
                      : `Add-ons (${bookingDetails.selectedAddons.length})`}
                  </span>
                  <span>{formatCurrency(addonTotal / (1 + taxRate))}</span>
                </div>

                {/* ✅ RULE APPLIED: Only show list if more than 1 add-on */}
                {bookingDetails.selectedAddons.length > 1 && (
                  <ul className="ml-4 text-sm text-gray-600 list-disc">
                    {bookingDetails.selectedAddons.map((addon) => (
                      <li
                        key={addon.id}
                        className="flex justify-between items-center"
                      >
                        <span>{addon.name}</span>
                        <span>
                          {formatCurrency((addon.price || 0) / (1 + taxRate))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          {/* ================================================================== */}
          {/* ✅ END: MODIFIED ADD-ON LOGIC */}
          {/* ================================================================== */}

          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Tax (GST @ 18%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>

          <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-teal-600">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full px-8 py-4 bg-teal-500 text-white rounded-full font-semibold text-lg hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-teal-500"
      >
        {loading
          ? 'Confirming...'
          : `Confirm Booking • ${formatCurrency(finalTotal)}`}
      </button>
    </div>
  );
};

export default ConfirmationStep;
