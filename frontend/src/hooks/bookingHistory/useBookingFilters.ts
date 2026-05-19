import { BookingData } from '@/types/bookingHistory.type';
import { filterBookings, sortBookings } from '@/utils/bookingHistory.utils';
import { useState, useMemo } from 'react';

export const useBookingFilters = (
  bookings: BookingData[],
  type: 'upcoming' | 'past'
) => {
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAndSortedBookings = useMemo(() => {
    const filtered = filterBookings(bookings, '', statusFilter);
    return sortBookings(filtered, sortBy, type);
  }, [bookings, sortBy, statusFilter, type]);

  return {
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    filteredBookings: filteredAndSortedBookings,
  };
};
