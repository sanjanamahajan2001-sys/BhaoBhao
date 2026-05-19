import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useBookingsFilter } from '../context/BookingsFilterContext';
import { useDebounce } from '../hooks/useDebounce';
import { bookingAPI } from '../services/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    searchTerm,
    statusFilter,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  } = useBookingsFilter();
  // ✅ debounce the search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchBookings = async (
    page = currentPage,
    limit = itemsPerPage,
    status = statusFilter,
    search = debouncedSearch
  ) => {
    setLoading(true);
    try {
      const res = await bookingAPI.getBookings(page, limit, status, search);
      if (res.success && res.data) {
        setBookings(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalRecords(res.data.pagination.totalRecords);
        setError(null);
      } else {
        setError(res.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters or page change
  useEffect(() => {
    fetchBookings(currentPage, itemsPerPage, statusFilter, debouncedSearch);
  }, [currentPage, itemsPerPage, statusFilter, debouncedSearch]);

  return {
    bookings,
    totalPages,
    totalRecords,
    loading,
    error,
    currentPage,
    refreshBookings: () =>
      fetchBookings(currentPage, itemsPerPage, statusFilter, debouncedSearch),
    setCurrentPage,
  };
};
