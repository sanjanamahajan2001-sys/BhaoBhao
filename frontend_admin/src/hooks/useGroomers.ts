// hooks/useGroomers.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { groomerAPI } from '../services/api';
import { GroomerData } from '../types';

export const useGroomers = () => {
  const [groomers, setGroomers] = useState<GroomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const limit = 100;
      let page = 1;
      let allGroomers: GroomerData[] = [];
      let totalPages = 1;

      do {
        const groomersResponse = await groomerAPI.getGroomers(page, limit);

        if (groomersResponse.success && groomersResponse.data) {
          const { data, pagination } = groomersResponse.data;
          allGroomers = [...allGroomers, ...data];
          totalPages = pagination?.totalPages || 1;
          page++;
        } else {
          break;
        }
      } while (page <= totalPages);

      setGroomers(allGroomers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load groomers';
      setError(errorMessage);
      console.error('Error loading groomers:', err);
      toast.error('Failed to load groomers');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGroomers = useCallback(() => {
    loadGroomers();
  }, [loadGroomers]);

  useEffect(() => {
    loadGroomers();
  }, [loadGroomers]);

  return {
    groomers,
    loading,
    error,
    refreshGroomers,
  };
};
