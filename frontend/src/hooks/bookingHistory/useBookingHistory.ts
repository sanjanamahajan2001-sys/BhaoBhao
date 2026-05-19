import { useAuth } from '@/contexts/AuthContext';
import { bookingApi } from '@/service/bookingHistoryApi';
import { PaginationParams } from '@/types/bookingHistory.type';
import { useQuery } from '@tanstack/react-query';

export const useBookingHistory = (params: PaginationParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [
      'bookings',
      user?.email,
      params.page,
      params.limit,
      params.upcomingPast,
      params.search,
      params.statusFilter,
    ],
    queryFn: () => bookingApi.fetchBookings(params),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
