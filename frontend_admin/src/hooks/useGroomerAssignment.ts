import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';

export const useGroomerAssignment = (onUpdate: () => void) => {
  const [updating, setUpdating] = useState<number | null>(null);

  const handleGroomerAssignment = useCallback(
    async (bookingId: number, groomerId: number) => {
      setUpdating(bookingId);

      try {
        const response = await bookingAPI.assignGroomer(
          bookingId.toString(),
          groomerId.toString()
        );

        if (response.success) {
          toast.success(response.message || 'Groomer assigned successfully');
          onUpdate();
        } else {
          toast.error(response.message || 'Failed to assign groomer');
        }
      } catch (error) {
        console.error('Error assigning groomer:', error);
        toast.error('Failed to assign groomer');
      } finally {
        setUpdating(null);
      }
    },
    [onUpdate]
  );

  return { handleGroomerAssignment, updating };
};
