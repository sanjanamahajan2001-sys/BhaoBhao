import React from 'react';
import { Calendar } from 'lucide-react';
import { Booking, GroomerData } from '../../types';
import BookingRow from './BookingRow';
import Pagination from '../common/Pagination';

interface BookingsTableProps {
  loading: boolean;
  bookings: Booking[];
  groomers: GroomerData[];
  onBookingUpdate: () => void;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  loading,
  bookings,
  groomers,
  onBookingUpdate,
  totalPages,
  totalItems,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1700px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 w-[200px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer & Pet
              </th>
              <th className="px-6 py-4 w-[300px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service & Details
              </th>
              <th className="px-6 py-4 w-[240px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet Details
              </th>
              <th className="px-6 py-4 w-[200px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 w-[200px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 w-[300px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions
              </th>
              <th className="px-6 py-4 w-[250px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groomer
              </th>
              <th className="px-6 py-4 w-[200px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OTP Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? null
              : bookings.map((booking) => (
                  <BookingRow
                    key={booking.booking.id}
                    booking={booking}
                    groomers={groomers}
                    onBookingUpdate={onBookingUpdate}
                  />
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={10}
        onPageChange={setCurrentPage}
      />

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0
              ? 'No bookings found'
              : 'No bookings match your filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {bookings.length === 0
              ? 'Bookings will appear here when available.'
              : 'Try adjusting your search criteria or filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;
