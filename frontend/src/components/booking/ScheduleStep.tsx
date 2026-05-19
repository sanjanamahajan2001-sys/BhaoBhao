import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const formatPrettyDate = (dateString: string) => {
  // ✅ Parse date string (YYYY-MM-DD) without timezone conversion
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  const dayNum = date.getDate();

  const suffix =
    dayNum % 10 === 1 && dayNum !== 11
      ? 'st'
      : dayNum % 10 === 2 && dayNum !== 12
        ? 'nd'
        : dayNum % 10 === 3 && dayNum !== 13
          ? 'rd'
          : 'th';

  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const yearNum = date.getFullYear();

  return `${dayNum}${suffix} ${monthName} ${yearNum}`;
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
  is_time_restricted?: boolean;  // NEW: Time restriction flag
  restriction_reason?: string;   // NEW: Reason for restriction
}

interface ScheduleStepProps {
  slot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
}

const fetchSlotsWithBookingStatus = async (date: string): Promise<SlotWithStatus[]> => {
  const { data } = await axiosInstance.get('/slots/get_slots_with_booking_status', {
    params: { date },
  });
  return data.data;
};

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  slot,
  onSlotSelect,
}) => {
  const todayISO = formatISODate(new Date());
  // ✅ Initialize with slot date if available (for rescheduling), otherwise use today
  const initialDate = slot?.date || todayISO;
  const [tempDate, setTempDate] = useState<string>(initialDate);
  const [tempTime, setTempTime] = useState<string>(slot?.time || '');
  
  // ✅ Use ref to track last slot values to prevent unnecessary updates
  const lastSlotRef = useRef<{ date?: string; time?: string }>({});

  // ✅ Sync local state with slot prop ONLY when slot actually changes
  useEffect(() => {
    const slotDate = slot?.date;
    const slotTime = slot?.time;
    
    // Only update if slot date actually changed
    if (slotDate && slotDate !== lastSlotRef.current.date) {
      setTempDate(slotDate);
      lastSlotRef.current.date = slotDate;
    }
    
    // Only update if slot time actually changed
    if (slotTime && slotTime !== lastSlotRef.current.time) {
      setTempTime(slotTime);
      lastSlotRef.current.time = slotTime;
    }
  }, [slot?.date, slot?.time]); // Dependencies are fine - we use ref to prevent unnecessary updates

  const { user } = useAuth();

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

  if (isLoading) return <p className="text-gray-600">Loading available slots...</p>;
  if (isError) return <p className="text-red-600">Failed to load slots. Please refresh.</p>;

  // NEW: Get earliest available slot for same-day booking message
  const getEarliestAvailableSlot = () => {
    const now = new Date();
    const minHour = now.getHours() + 4; // 4-hour gap
    const nextSlotHour = Math.ceil(minHour);
    
    // Find the next available slot in our slot format
    const availableSlot = availableSlots.find(s => {
      const slotHour = parseInt(s.slot.split(':')[0], 10);
      return !s.is_booked && !s.is_time_restricted && slotHour >= nextSlotHour;
    });
    
    if (availableSlot) {
      return availableSlot.slot; // Returns in format "15:00 - 16:00"
    }
    return null;
  };

  const morningSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.slot.split(':')[0], 10);
    return hour >= 10 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.slot.split(':')[0], 10);
    return hour >= 12 && hour < 18;
  });

  const now = new Date();
  const isPastSlot = (slot: string, date: string) => {
    const [hourStr, minuteStr] = slot.split(':');
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStr, 10) || 0;
    const slotDateTime = new Date(date);
    slotDateTime.setHours(slotHour, slotMinute, 0, 0);
    return slotDateTime <= now;
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Schedule Appointment
        </h2>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <div className="flex justify-center">
            <div className="relative custom-datepicker">
              <DatePicker
                selected={tempDate ? new Date(tempDate + 'T12:00:00') : null}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) {
                    toast.error('You cannot select a past date.');
                    return;
                  }

                  // ✅ Use formatISODate to get YYYY-MM-DD format (no timezone shift)
                  const iso = formatISODate(date);
                  setTempDate(iso);
                  setTempTime('');

                  // ✅ Update parent state immediately with the selected date
                  onSlotSelect({ date: iso, time: '' });
                }}

                inline
                minDate={new Date()}
                dayClassName={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isSelected =
                    tempDate &&
                    new Date(tempDate).toDateString() === date.toDateString();

                  if (date < today)
                    return '!text-slate-400 !cursor-not-allowed !bg-slate-50';
                  if (isSelected)
                    return '!bg-emerald-600 !text-white !font-bold !rounded-lg !shadow-md';
                  return '!text-slate-700 hover:!bg-emerald-50 hover:!text-emerald-700 !rounded-lg !transition-all !duration-200 hover:!scale-105';
                }}
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

          {/* NEW: Same-day booking message */}
          {tempDate === todayISO && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Same-day bookings:</strong> Require 4-hour advance notice. 
                {getEarliestAvailableSlot() && (
                  <span> Earliest available slot: <strong>{getEarliestAvailableSlot()}</strong></span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Time Slots */}
        {tempDate && (
          <div>
            <p className="text-gray-600 text-sm mb-2">Morning (9 AM – 12 PM)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {morningSlots.map((s) => {
                const slotTime = s.slot;
                const isSelected = tempTime === slotTime && tempDate;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      // NEW: Check for time restrictions
                      if (s.is_time_restricted) {
                        toast.error(s.restriction_reason || "This slot is temporarily unavailable");
                        return;
                      }
                      
                      if (!s.is_booked && !isPastSlot(slotTime, tempDate)) {
                        setTempTime(slotTime);
                        // ✅ Always update parent state with current tempDate and selected time
                        onSlotSelect({ date: tempDate, time: slotTime });
                      }
                    }}
                    disabled={s.is_booked || isPastSlot(slotTime, tempDate) || s.is_time_restricted}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${s.is_booked || isPastSlot(slotTime, tempDate) || s.is_time_restricted
                        ? 'bg-red-100 text-red-500 cursor-not-allowed border border-red-200'  // More explicit red styling
                        : isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {slotTime}
                  </button>
                );
              })}
            </div>

            <p className="text-gray-600 text-sm mb-2">Afternoon (12 PM – 6 PM)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {afternoonSlots.map((s) => {
                const slotTime = s.slot;
                const isSelected = tempTime === slotTime && tempDate;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      // NEW: Check for time restrictions
                      if (s.is_time_restricted) {
                        toast.error(s.restriction_reason || "This slot is temporarily unavailable");
                        return;
                      }
                      
                      if (!s.is_booked && !isPastSlot(slotTime, tempDate)) {
                        setTempTime(slotTime);
                        // ✅ Always update parent state with current tempDate and selected time
                        onSlotSelect({ date: tempDate, time: slotTime });
                      }
                    }}
                    disabled={s.is_booked || isPastSlot(slotTime, tempDate) || s.is_time_restricted}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${s.is_booked || isPastSlot(slotTime, tempDate) || s.is_time_restricted
                        ? 'bg-red-100 text-red-500 cursor-not-allowed border border-red-200'  // More explicit red styling
                        : isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {slotTime}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleStep;
