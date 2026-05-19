// pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useBookings } from '../hooks/useBookings';
import { StatsCards } from '../components/dashboard/StatsCards';
import { FilterTabs } from '../components/dashboard/FilterTabs';
import { BookingList } from '../components/dashboard/BookingList';
import Pagination from '../components/Pagination';
import { useGroomerAnalytics } from '../hooks/useGroomerAnalytics';

export const Dashboard: React.FC = () => {
  const { bookings, pagination, status, isLoading, fetchBookings } =
    useBookings(1, 10);
  // inside component
  const { stats, loading: statsLoading, error } = useGroomerAnalytics();

  const [filter, setFilter] = useState<
    'all' | 'scheduled' | 'in-progress' | 'completed'
  >('all');

  // Sync filter with API status
  useEffect(() => {
    const statusMap: Record<
      typeof filter,
      '' | 'Scheduled' | 'In Progress' | 'Completed'
    > = {
      all: '',
      scheduled: 'Scheduled',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };
    fetchBookings(1, pagination.perPage, statusMap[filter]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // const stats = {
  //   total: pagination.totalRecords,
  //   scheduled: 0, // ⚡ you’ll probably expose scheduled count via backend later
  //   inProgress: 0,
  //   completed: 0,
  // };

  if (isLoading || statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your pet grooming appointments</p>
        </header>

        <StatsCards stats={stats} />
        <FilterTabs filter={filter} setFilter={setFilter} stats={stats} />
        <BookingList
          bookings={bookings}
          filter={filter}
          onStatusUpdate={() => fetchBookings()}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.perPage}
          onPageChange={(page) =>
            fetchBookings(page, pagination.perPage, status)
          }
        />
      </div>
    </Layout>
  );
};
