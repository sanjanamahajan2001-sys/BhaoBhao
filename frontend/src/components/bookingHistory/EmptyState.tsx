import React from 'react';
import { Calendar } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-bookings' | 'no-results' | 'upcoming' | 'past';
  searchQuery?: string;
  statusFilter?: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  statusFilter,
  onClearFilters,
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-bookings':
        return {
          title: 'No bookings yet',
          description:
            "You haven't made any appointments yet. Book your first grooming session!",
          actionButton: (
            <button
              onClick={() => (window.location.href = '/auth/booking')}
              className="px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Book Now
            </button>
          ),
        };
      case 'upcoming':
        return {
          title: 'No upcoming appointments',
          description:
            searchQuery || statusFilter !== 'all'
              ? 'Try changing your search or filter criteria'
              : "You don't have any upcoming appointments",
          actionButton:
            searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = '/auth/booking')}
                className="px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Book Now
              </button>
            ),
        };
      case 'past':
        return {
          title: 'No past appointments',
          description:
            searchQuery || statusFilter !== 'all'
              ? 'Try changing your search or filter criteria'
              : "You don't have any past appointments yet",
          actionButton:
            searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium mt-4"
              >
                Clear filters
              </button>
            ) : null,
        };
      default:
        return {
          title: 'No results found',
          description: 'Try adjusting your search criteria',
          actionButton: null,
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
        <Calendar className="h-6 w-6 text-gray-400 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 mb-4">{content.description}</p>
      {content.actionButton}
    </div>
  );
};

