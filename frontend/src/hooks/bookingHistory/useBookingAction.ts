import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useBooking } from '@/contexts/BookingContext';
import { BookingData } from '@/types/bookingHistory.type';
import { bookingApi } from '@/service/bookingHistoryApi';

export const useBookingActions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setIsRescheduling, setOriginalBooking } = useBooking();

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingApi.cancelBooking(id),
    onSuccess: async () => {
      toast.success('Booking cancelled successfully.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
      ]);
    },
    onError: () => {
      toast.error('Failed to cancel booking.');
    },
  });

  const handleCancel = async (bookingId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This booking will be cancelled permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    });

    if (result.isConfirmed) {
      cancelMutation.mutate(bookingId);
    }
  };

  const handleReschedule = (bookingData: BookingData) => {
    setIsRescheduling(true);
    setOriginalBooking(bookingData);
    navigate('/booking');
  };

  return {
    handleCancel,
    handleReschedule,
    isLoading: cancelMutation.isPending,
  };
};
