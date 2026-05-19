// components/dashboard/BookingList.tsx
import { Calendar } from 'lucide-react';
import { BookingData } from '../../types';
import { BookingCard } from '../BookingCard';

interface BookingListProps {
  bookings: BookingData[];
  filter: string;
  onStatusUpdate: () => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  filter,
  onStatusUpdate,
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No bookings found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {filter === 'all'
            ? 'You have no bookings yet.'
            : `No ${filter} bookings found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {bookings.map((item) => (
        <BookingCard
          key={item.booking.id}
          booking={item}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
};
