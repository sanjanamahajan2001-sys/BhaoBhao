import React from 'react';
import { Calendar, CheckCircle, Play, Clock, UserCheck } from 'lucide-react';
import { Booking, BookingStatus, GroomerData } from '../../types';
// import { Booking, GroomerData, BookingStatus } from '../types';

interface ActivityPanelProps {
  bookings: Booking[];
  groomers: GroomerData[];
}

const statusColors: Record<BookingStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return <Calendar className="h-4 w-4" />;
    case 'Confirmed':
      return <CheckCircle className="h-4 w-4" />;
    case 'In Progress':
      return <Play className="h-4 w-4" />;
    case 'Completed':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const ActivityPanel: React.FC<ActivityPanelProps> = ({
  bookings,
  groomers,
}) => {
  const recentBookings = bookings
    .sort(
      (a, b) =>
        new Date(b.booking.appointment_time_slot).getTime() -
        new Date(a.booking.appointment_time_slot).getTime()
    )
    .slice(0, 3);

  const groomerStats = groomers.slice(0, 4).map((groomer) => {
    const assignedBookings = bookings.filter(
      (b) => b.booking.groomer_id === groomer.id
    ).length;
    const completedBookings = bookings.filter(
      (b) =>
        b.booking.groomer_id === groomer.id && b.booking.status === 'Completed'
    ).length;
    const completionRate =
      assignedBookings > 0
        ? ((completedBookings / assignedBookings) * 100).toFixed(0)
        : '0';

    return {
      groomer,
      assignedBookings,
      completedBookings,
      completionRate,
    };
  });

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentBookings.map((booking, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                  statusColors[booking.booking.status as BookingStatus] ||
                  statusColors.Scheduled
                }`}
              >
                {getStatusIcon(booking.booking.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {booking?.customer?.customer_name} - {booking?.pet?.pet_name}
                </p>
                <p className="text-xs text-gray-500">
                  {booking?.service?.service_name} • {booking?.booking?.status}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(
                  booking?.booking.appointment_time_slot
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentBookings.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Groomer Performance */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Groomer Performance
        </h3>
        <div className="space-y-3">
          {groomerStats.map(({ groomer, assignedBookings, completionRate }) => (
            <div
              key={groomer.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {groomer.groomer_name}
                  </p>
                  <p className="text-xs text-gray-500">{groomer.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {completionRate}%
                </p>
                <p className="text-xs text-gray-500">
                  {assignedBookings} bookings
                </p>
              </div>
            </div>
          ))}
          {groomerStats.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No groomers available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPanel;
