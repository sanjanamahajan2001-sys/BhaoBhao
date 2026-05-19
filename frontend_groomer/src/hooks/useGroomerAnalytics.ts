// hooks/useGroomerAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../services/api';

interface GroomerStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
}

interface UseGroomerAnalytics {
  stats: GroomerStats;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useGroomerAnalytics = (): UseGroomerAnalytics => {
  const [stats, setStats] = useState<GroomerStats>({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsAPI.getGroomerDashboardCounters();
      if (response.success) {
        setStats(response.counters);
      } else {
        setError(response.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};
