// hooks/useBookings.ts
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingService } from '../services/api';
import { BookingData } from '../types';

interface PaginationMeta {
  totalRecords: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

export const useBookings = (
  initialPage = 1,
  initialLimit = 10,
  initialStatus: '' | 'Scheduled' | 'In Progress' | 'Completed' = ''
) => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalRecords: 0,
    currentPage: initialPage,
    perPage: initialLimit,
    totalPages: 1,
  });
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookings = async (
    page = pagination.currentPage,
    limit = pagination.perPage,
    bookingStatus = status
  ) => {
    setIsLoading(true);
    try {
      const { data } = await bookingService.getMyBookings({
        page,
        limit,
        status: bookingStatus,
      });

      setBookings(data.data || []);
      setPagination(data.pagination);
      setStatus(bookingStatus);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchBookings(initialPage, initialLimit, initialStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    bookings,
    pagination,
    status,
    setStatus,
    isLoading,
    fetchBookings,
  };
};
