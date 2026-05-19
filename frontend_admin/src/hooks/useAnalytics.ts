import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../services/api';

interface AnalyticsData {
  // Overall stats (from API now)
  totalBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  scheduledBookings: number;
  cancelledBookings: number;

  // API-provided stats
  monthlyTotalBookings: number;
  monthlyRepeatCustomers: number;
  todayBookings: number;

  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const useAnalytics = (): AnalyticsData => {
  const [stats, setStats] = useState<AnalyticsData>({
    totalBookings: 0,
    completedBookings: 0,
    inProgressBookings: 0,
    scheduledBookings: 0,
    cancelledBookings: 0,
    monthlyTotalBookings: 0,
    monthlyRepeatCustomers: 0,
    todayBookings: 0,
    loading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await analyticsAPI.getDashboardCounters();

      if (response.success) {
        const counters = response.counters;
        setStats({
          totalBookings: counters.overallTotalBookings || 0,
          completedBookings: counters.completed || 0,
          inProgressBookings: counters.inProgress || 0,
          scheduledBookings: counters.scheduled || 0,
          cancelledBookings: counters.cancelled || 0,
          monthlyTotalBookings: counters.monthlyTotalBookings || 0,
          monthlyRepeatCustomers: counters.monthlyRepeatCustomer || 0,
          todayBookings: counters.todayBookings || 0,
          loading: false,
          error: null,
        });
      } else {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to fetch analytics',
        }));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch analytics';
      setStats((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return stats;
};
