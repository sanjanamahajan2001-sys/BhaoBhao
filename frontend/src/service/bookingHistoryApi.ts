import {
  BookingApiResponse,
  BookingData,
  PaginationParams,
} from '@/types/bookingHistory.type';
import axiosInstance from '@/utils/axiosInstance';

export const bookingApi = {
  fetchBookings: async (
    params: PaginationParams
  ): Promise<BookingApiResponse> => {
    const { page, limit, upcomingPast, search, statusFilter } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (upcomingPast) queryParams.append('upcomingPast', upcomingPast);
    if (search) queryParams.append('search', search);
    if (statusFilter && statusFilter !== 'all') {
      queryParams.append('status', statusFilter);
    }

    const res = await axiosInstance.get<BookingApiResponse>(
      `/bookings/list?${queryParams.toString()}`
    );
    return res.data;
  },

  cancelBooking: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/bookings/delete/${id}`);
  },

  rescheduleBooking: async (
    id: number,
    payload: BookingData
  ): Promise<void> => {
    await axiosInstance.put(`/bookings/update/${id}`, payload);
  },
};
