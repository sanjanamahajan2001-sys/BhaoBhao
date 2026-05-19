import { BookingData } from '@/types/bookingHistory.type';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return CheckCircle;
    case 'completed':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    case 'pending':
      return AlertCircle;
    default:
      return Clock;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const filterBookings = (
  bookings: BookingData[],
  searchQuery: string,
  statusFilter: string
): BookingData[] => {
  return bookings.filter((booking) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      booking.service.servicename
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.pet.petname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking.orderid.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      booking.booking.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
};

export const sortBookings = (
  bookings: BookingData[],
  sortBy: 'date' | 'status',
  type: 'upcoming' | 'past'
): BookingData[] => {
  if (sortBy === 'date') {
    return [...bookings].sort((a, b) => {
      if (type === 'upcoming') {
        // Ascending (soonest first)
        return (
          new Date(a.booking.appointmenttimeslot).getTime() -
          new Date(b.booking.appointmenttimeslot).getTime()
        );
      } else {
        // Descending (most recent past first)
        return (
          new Date(b.booking.appointmenttimeslot).getTime() -
          new Date(a.booking.appointmenttimeslot).getTime()
        );
      }
    });
  } else {
    return [...bookings].sort((a, b) =>
      a.booking.status.localeCompare(b.booking.status)
    );
  }
};

export const calculateTotalPaid = (transactions: any[]): number => {
  return transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
};

export const calculateBalance = (
  total: number,
  transactions: any[]
): number => {
  return total - calculateTotalPaid(transactions);
};
