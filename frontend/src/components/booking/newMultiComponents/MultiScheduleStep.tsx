'use client';

import type React from 'react';
import { useState } from 'react';
import { Calendar, X, CheckCircle } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { ServicePetConnection } from '@/types/booking.type';
import { getImageUrl } from '@/utils/imageUtils';

export const formatPrettyDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';

  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};

export const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Slot {
  date: string;
  time: string;
}

interface SlotWithStatus {
  id: number;
  slot: string;
  is_booked: boolean;
}

interface MultiScheduleStepProps {
  connections: ServicePetConnection[];
  onUpdateConnection: (
    connectionId: string,
    updates: Partial<ServicePetConnection>
  ) => void;
  isRescheduling: boolean;
}

const fetchSlotsWithBookingStatus = async (
  date: string
): Promise<SlotWithStatus[]> => {
  const { data } = await axiosInstance.get(
    '/slots/get_slots_with_booking_status',
    {
      params: { date },
    }
  );
  return data.data;
};

const MultiScheduleStep: React.FC<MultiScheduleStepProps> = ({
  connections,
  onUpdateConnection,
  isRescheduling,
}) => {
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(
    connections.length > 0 ? connections[0].id : null
  );
  const [tempDate, setTempDate] = useState<string>('');
  const [tempTime, setTempTime] = useState<string>('');

  const { user } = useAuth();

  // Get current active connection
  const activeConnection = connections.find(
    (conn) => conn.id === activeConnectionId
  );

  // Fetch slots only when date is chosen
  const {
    data: availableSlots = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['slotsWithStatus', tempDate],
    queryFn: () => fetchSlotsWithBookingStatus(tempDate),
    enabled: !!tempDate && !!user,
    placeholderData: keepPreviousData,
  });

  const handleAssignSlot = () => {
    if (!tempDate || !tempTime || !activeConnectionId) return;

    const isSlotTaken = connections.some(
      (conn) =>
        conn.id !== activeConnectionId &&
        conn.timeSlot?.date === tempDate &&
        conn.timeSlot?.time === tempTime
    );

    if (isSlotTaken) {
      toast.error('This slot is already assigned to another service.');
      return;
    }

    onUpdateConnection(activeConnectionId, {
      timeSlot: { date: tempDate, time: tempTime },
    });

    toast.success('Timeslot assigned successfully!');
    setTempDate('');
    setTempTime('');

    const nextUnscheduled = connections.find(
      (conn) => conn.id !== activeConnectionId && !conn.timeSlot
    );
    if (nextUnscheduled) {
      setActiveConnectionId(nextUnscheduled.id);
    }
  };

  const handleRemoveSlot = (connectionId: string) => {
    onUpdateConnection(connectionId, { timeSlot: undefined });
    toast.success('Timeslot removed');
  };

  // Get scheduled and unscheduled connections
  const scheduledConnections = connections.filter((conn) => conn.timeSlot);
  const unscheduledConnections = connections.filter((conn) => !conn.timeSlot);

  if (isLoading) {
    return <p className="text-gray-600">Loading available slots...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">Failed to load slots. Please refresh.</p>
    );
  }

  // Divide into Morning (9-12) and Afternoon (12-6)
  const morningSlots = availableSlots.filter((s) => {
    const hour = Number.parseInt(s.slot.split(':')[0], 10);
    return hour >= 10 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter((s) => {
    const hour = Number.parseInt(s.slot.split(':')[0], 10);
    return hour >= 12 && hour < 18;
  });

  const now = new Date();

  const isPastSlot = (slot: string, date: string) => {
    const [hourStr, minuteStr] = slot.split(':');
    const slotHour = Number.parseInt(hourStr, 10);
    const slotMinute = Number.parseInt(minuteStr, 10) || 0;

    const slotDateTime = new Date(date);
    slotDateTime.setHours(slotHour, slotMinute, 0, 0);

    return slotDateTime <= now;
  };

  const isSlotAssigned = (slot: string, date: string) => {
    return connections.some(
      (conn) => conn.timeSlot?.date === date && conn.timeSlot?.time === slot
    );
  };

  return (
    <>
      <style>{`
        .custom-datepicker .react-datepicker {
          background: white;
          border: 2px solid #10b981;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          font-weight: 500;
        }
        .custom-datepicker .react-datepicker__header {
          background: linear-gradient(to right, #10b981, #14b8a6);
          color: white;
          border: none;
          border-radius: 14px 14px 0 0;
          padding-top: 12px;
        }
        .custom-datepicker .react-datepicker__current-month {
          color: white;
          font-weight: 600;
        }
        .custom-datepicker .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .custom-datepicker .react-datepicker__navigation {
          top: 6px;
        }
        .custom-datepicker .react-datepicker__navigation-icon::before {
          border-color: white;
          border-top-color: white;
          border-right-color: white;
        }
      `}</style>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Schedule Appointments
          </h2>
          <p className="text-gray-600">
            Assign timeslots to each service-pet combination
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
            Select Connection to Schedule
          </h3>

          {/* Unscheduled Connections */}
          {unscheduledConnections.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Pending ({unscheduledConnections.length})
              </p>
              <div className="grid gap-3">
                {unscheduledConnections.map((connection) => (
                  <button
                    key={connection.id}
                    onClick={() => setActiveConnectionId(connection.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      activeConnectionId === connection.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(connection.service.photos[0], 'services')}
                          alt={connection.service.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {connection.service.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            for {connection.pet.pet_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">
                          ₹{connection.selectedPricing.discounted_price}
                        </p>
                        <p className="text-xs text-gray-500">
                          {connection.service.durationMinutes}min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Connections */}
          {scheduledConnections.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Scheduled ({scheduledConnections.length})
              </p>
              <div className="grid gap-3">
                {scheduledConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="p-4 rounded-xl border-2 border-green-200 bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <img
                          src={getImageUrl(connection.service.photos[0], 'services')}
                          alt={connection.service.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {connection.service.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            for {connection.pet.pet_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrettyDate(connection.timeSlot!.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {connection.timeSlot!.time}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(connection.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeConnection && !activeConnection.timeSlot && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Schedule: {activeConnection.service.name} for{' '}
                {activeConnection.pet.pet_name}
              </h3>

              {/* Date Picker - Keep existing UI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Date
                </label>
                <div className="flex justify-center">
                  <div className="relative custom-datepicker">
                    <DatePicker
                      selected={tempDate ? new Date(tempDate) : null}
                      onChange={(date: Date | null) => {
                        if (!date) return;

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (date < today) {
                          toast.error('You cannot select a past date.');
                          setTempDate('');
                          return;
                        }

                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          '0'
                        );
                        const day = String(date.getDate()).padStart(2, '0');
                        const iso = `${year}-${month}-${day}`;

                        setTempDate(iso);
                        setTempTime('');
                      }}
                      inline
                      minDate={new Date()}
                      dayClassName={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isSelected =
                          tempDate &&
                          new Date(tempDate).toDateString() ===
                            date.toDateString();

                        if (date < today) {
                          return '!text-slate-400 !cursor-not-allowed !bg-slate-50';
                        }
                        if (isSelected) {
                          return '!bg-emerald-600 !text-white !font-bold !rounded-lg !shadow-md';
                        }
                        return '!text-slate-700 hover:!bg-emerald-50 hover:!text-emerald-700 !rounded-lg !transition-all !duration-200 hover:!scale-105';
                      }}
                      wrapperClassName="w-full flex justify-center"
                    />
                  </div>
                </div>
                {tempDate && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>Selected: {formatPrettyDate(tempDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots - Keep existing UI */}
              {tempDate && (
                <div className="mt-6">
                  {/* Morning */}
                  <p className="text-gray-600 text-sm mb-2">
                    Morning (9 AM – 12 PM)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {morningSlots.map((s) => {
                      const isBooked = s.is_booked;
                      const isPast = isPastSlot(s.slot, tempDate);
                      const isAssigned = isSlotAssigned(s.slot, tempDate);
                      const isDisabled = isBooked || isPast || isAssigned;

                      return (
                        <button
                          key={s.id}
                          onClick={() => !isDisabled && setTempTime(s.slot)}
                          disabled={isDisabled}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            isDisabled
                              ? 'bg-red-100 text-red-400 cursor-not-allowed'
                              : tempTime === s.slot
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={
                            isBooked
                              ? 'Already booked'
                              : isPast
                              ? 'This time has already passed'
                              : isAssigned
                              ? 'Already assigned to another service'
                              : ''
                          }
                        >
                          {s.slot}
                        </button>
                      );
                    })}
                  </div>

                  {/* Afternoon */}
                  <p className="text-gray-600 text-sm mb-2">
                    Afternoon (12 PM – 6 PM)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {afternoonSlots.map((s) => {
                      const isBooked = s.is_booked;
                      const isPast = isPastSlot(s.slot, tempDate);
                      const isAssigned = isSlotAssigned(s.slot, tempDate);
                      const isDisabled = isBooked || isPast || isAssigned;

                      return (
                        <button
                          key={s.id}
                          onClick={() => !isDisabled && setTempTime(s.slot)}
                          disabled={isDisabled}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            isDisabled
                              ? 'bg-red-100 text-red-400 cursor-not-allowed'
                              : tempTime === s.slot
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={
                            isBooked
                              ? 'Already booked'
                              : isPast
                              ? 'This time has already passed'
                              : isAssigned
                              ? 'Already assigned to another service'
                              : ''
                          }
                        >
                          {s.slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assign Slot Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAssignSlot}
                  disabled={!tempDate || !tempTime}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Timeslot
                </button>
              </div>
            </div>
          </>
        )}

        {unscheduledConnections.length === 0 &&
          scheduledConnections.length > 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All Services Scheduled!
              </h3>
              <p className="text-gray-600">
                You can proceed to the next step or modify any timeslots above.
              </p>
            </div>
          )}
      </div>
    </>
  );
};

export default MultiScheduleStep;
