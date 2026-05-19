// HomePage.tsx
import React from 'react';
import Header from './Header';
import { useBookings } from '../hooks/useBookings';
import { useGroomers } from '../hooks/useGroomers';
import StatsCards from './dashboard/StatsCards';
import BookingsFilters from './dashboard/BookingsFilters';
import BookingsTable from './dashboard/BookingsTable';
import Footer from './common/Footer';

interface HomePageProps {
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
  const {
    bookings,
    totalPages,
    totalRecords,
    loading: bookingsLoading,
    error: bookingsError,
    refreshBookings,
    currentPage,
    setCurrentPage,
  } = useBookings();

  const {
    groomers,
    loading: groomersLoading,
    error: groomersError,
  } = useGroomers();

  const loading = bookingsLoading || groomersLoading;

  // if (loading) {
  //   return <LoadingSpinner message="Loading bookings..." />;
  // }

  if (bookingsError || groomersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data</p>
          <button
            onClick={() => {
              refreshBookings();
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header handleLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StatsCards />
        <BookingsFilters />
        <BookingsTable
          bookings={bookings}
          groomers={groomers}
          onBookingUpdate={refreshBookings}
          totalPages={totalPages}
          totalItems={totalRecords}
          currentPage={currentPage} // get from context
          setCurrentPage={setCurrentPage}
          loading={loading}
        />
        {/* <ActivityPanel bookings={bookings} groomers={groomers} /> */}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
