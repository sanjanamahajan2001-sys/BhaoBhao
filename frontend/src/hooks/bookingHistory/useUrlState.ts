import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const upcomingPast = (searchParams.get('upcomingPast') || 'upcoming') as
    | 'upcoming'
    | 'past';
  const searchQuery = searchParams.get('search') || '';

  const updateUrlParams = useCallback(
    (updates: Record<string, string | number>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          newParams.delete(key);
        } else {
          newParams.set(key, value.toString());
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  return {
    currentPage,
    limit,
    upcomingPast,
    searchQuery,
    updateUrlParams,
  };
};
