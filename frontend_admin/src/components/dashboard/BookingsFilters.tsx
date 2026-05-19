import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useBookingsFilter } from '../../context/BookingsFilterContext';

const statusOptions = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const BookingsFilters: React.FC = () => {
  const {
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,
    itemsPerPage,
    setSearchTerm,
    setStatusFilter,
    setDateFilter,
    setSortBy,
    setSortOrder,
    setItemsPerPage,
  } = useBookingsFilter();

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field as 'date' | 'status' | 'customer');
    setSortOrder(order as 'asc' | 'desc');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-3 pl-10 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition  `}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Dates</option>
          <option value="Today">Today</option>
          <option value="Tomorrow">Tomorrow</option>
          <option value="This Week">This Week</option>
        </select> */}

        {/* <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date-asc">Date (Earliest)</option>
          <option value="date-desc">Date (Latest)</option>
          <option value="status-asc">Status (A-Z)</option>
          <option value="status-desc">Status (Z-A)</option>
          <option value="customer-asc">Customer (A-Z)</option>
          <option value="customer-desc">Customer (Z-A)</option>
        </select> */}

        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          Filters Applied
        </div>
      </div>
    </div>
  );
};

export default BookingsFilters;
