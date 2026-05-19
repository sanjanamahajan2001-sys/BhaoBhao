import React from 'react';
import { Search, SortAsc, Filter, Loader2 } from 'lucide-react';

interface BookingFiltersProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  sortBy: 'date' | 'status';
  onSortChange: (sort: 'date' | 'status') => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isSearching?: boolean; // 👈 Optional prop for search loading state
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  isSearching = false,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          {/* 👈 Show loading spinner when searching */}
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          )}
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 max-sm:flex-col">
          {/* <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'date' | 'status')}
              className="pl-10 pr-8 py-2 border border-gray-300 max-sm:w-full rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div> */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 max-sm:w-full rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
