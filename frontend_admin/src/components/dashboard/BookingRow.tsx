import React, { useState } from 'react';
import {
  User,
  Clock,
  IndianRupee,
  MapPin,
  Calendar,
  CheckCircle,
  Play,
  XCircle,
  AlertTriangle,
  UserCheck,
  Search,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Booking, BookingStatus, GroomerData } from '../../types';
import { useGroomerAssignment } from '../../hooks/useGroomerAssignment';
import TransactionModal from '../TransactionModal';

import { formatAddress } from '../../utils/commonFunctions';

interface BookingRowProps {
  booking: Booking;
  groomers: GroomerData[];
  onBookingUpdate: () => void;
}

const statusColors: Record<BookingStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  Confirmed: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
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
    case 'Cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatOptionalText = (value?: string | null) => {
  if (!value) return '—';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '—';
};

const BookingRow: React.FC<BookingRowProps> = ({
  booking,
  groomers,
  onBookingUpdate,
}) => {
  const [showTransactionModal, setShowTransactionModal] = useState<
    number | null
  >(null);
  const [showGroomerDropdown, setShowGroomerDropdown] = useState(false);
  const [groomerSearch, setGroomerSearch] = useState('');

  const navigate = useNavigate();
  const { handleGroomerAssignment, updating } =
    useGroomerAssignment(onBookingUpdate);

  const filteredGroomers = groomers.filter((groomer) =>
    groomer.groomer_name.toLowerCase().includes(groomerSearch.toLowerCase())
  );

  const paidAmount =
    booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = parseFloat((booking.booking.total - paidAmount).toFixed(2));

  // Check if appointment is within 1 hour or has passed
  const appointmentTime = new Date(booking.booking.appointment_time_slot);
  const currentTime = new Date();
  const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);
  const canChangeGroomer = appointmentTime > oneHourFromNow;
  const appointmentHasPassed = appointmentTime < currentTime;

  // Get restriction message
  const getRestrictionMessage = () => {
    if (appointmentHasPassed) {
      return 'Appointment has passed';
    }
    return 'Cannot change (< 1 hour to appointment)';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* Customer & Pet */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {booking?.customer?.customer_name || 'Unknown Customer'}
            </div>
            <div className="text-sm text-gray-500 flex flex-col">
              <span className="mr-2">Pet: {booking?.pet?.pet_name}</span>
              <span>{booking?.customer?.mobile_number}</span>
              <span className="text-xs text-gray-400">
                Booked at:{' '}
                {booking.booking.createdat
                  ? formatDateTime(booking.booking.createdat)
                  : '—'}
              </span>
              {booking.booking.deletedat && (
                <span className="text-xs text-red-400">
                  Cancelled at:{' '}
                  {formatDateTime(booking.booking.deletedat)}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Service & Details */}
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {booking.service.service_name}
          </div>
          {booking.addon_services && booking.addon_services.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium text-blue-600">Add-ons:</span>{' '}
              {booking.addon_services.map((addon, idx) => (
                <span key={addon.pricing_id}>
                  {addon.service_name}
                  {idx < booking.addon_services!.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {booking.service.duration_minutes} min
            <IndianRupee className="h-3 w-3 ml-3 mr-1" />
            {booking.booking.total}
          </div>
          <div className="text-xs text-gray-400 flex items-start mt-1 gap-1">
            <MapPin className="h-3 w-3 mt-0.5" />
            <span className="whitespace-normal break-words">
              {formatAddress(booking?.address)}
            </span>
          </div>
        </div>
      </td>

      {/* Pet Details */}
      <td className="px-6 py-4">
        <div className="space-y-1 text-xs text-gray-600">
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            {formatOptionalText(booking.pet_type?.name)}
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>{' '}
            {formatOptionalText(booking.pet?.pet_gender)}
          </div>
          <div>
            <span className="text-gray-500">Breed:</span>{' '}
            {formatOptionalText(booking.pet_breed?.breed_name)}
          </div>
          <div>
            <span className="text-gray-500">Skin:</span>{' '}
            {formatOptionalText(booking.pet?.skin_condition)}
          </div>
          <div>
            <span className="text-gray-500">Nature:</span>{' '}
            {formatOptionalText(booking.pet?.nature)}
          </div>
          <div>
            <span className="text-gray-500">Health:</span>{' '}
            {formatOptionalText(booking.pet?.health_conditions)}
          </div>
          <div>
            <span className="text-gray-500">Pet Comments:</span>{' '}
            {formatOptionalText(booking.pet?.comments)}
          </div>
          <div>
            <span className="text-gray-500">Notes:</span>{' '}
            {formatOptionalText(booking.booking?.notes)}
          </div>
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {formatDateTime(booking.booking.appointment_time_slot)}
        </div>
        <div className="text-xs text-gray-500">
          Order: {booking.booking.order_id}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.booking.status as BookingStatus] ||
            statusColors['Scheduled']
            }`}
        >
          {getStatusIcon(booking.booking.status)}
          <span className="ml-1">{booking.booking.status}</span>
        </span>
      </td>

      {/* Transactions */}
      <td className="px-6 py-4 align-top">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 flex items-center justify-between">
            <span>Total:</span>
            <span>₹{booking.booking.total}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Paid</span>
            <span className="font-medium text-green-600">₹{paidAmount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Balance</span>
            <span className="font-medium text-red-600">₹{balance}</span>
          </div>
          <button
            onClick={() => setShowTransactionModal(booking.booking.id)}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
          >
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            View Details
          </button>
        </div>

        <TransactionModal
          showTransactionModal={showTransactionModal}
          setShowTransactionModal={setShowTransactionModal}
          booking={booking}
          onPaymentAdded={onBookingUpdate}
        />
      </td>

      {/* Groomer */}
      <td className="px-6 py-4">
        {booking.groomer ? (
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {booking.groomer.groomer_name}
                </div>
                <div className="text-xs text-gray-500">
                  {booking.groomer.level}
                </div>
              </div>
            </div>
            {canChangeGroomer ? (
              <button
                onClick={() => setShowGroomerDropdown(!showGroomerDropdown)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={updating === booking.booking.id}
              >
                {updating === booking.booking.id ? 'Updating...' : 'Change Groomer'}
              </button>
            ) : (
              <div className="flex items-center text-xs text-gray-500 italic">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {getRestrictionMessage()}
              </div>
            )}

            {showGroomerDropdown && (
              <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search groomers..."
                      value={groomerSearch}
                      onChange={(e) => setGroomerSearch(e.target.value)}
                      className="w-full p-3 pl-10 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {filteredGroomers.map((groomer) => (
                      <button
                        key={groomer.id}
                        onClick={() => {
                          handleGroomerAssignment(
                            booking.booking.id,
                            groomer.id
                          );
                          setShowGroomerDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {groomer.groomer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {groomer.level}
                        </div>
                      </button>
                    ))}
                    {filteredGroomers.length === 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No groomers found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {canChangeGroomer ? (
              <button
                onClick={() => setShowGroomerDropdown(!showGroomerDropdown)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={updating === booking.booking.id}
              >
                {updating === booking.booking.id ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                Assign Groomer
              </button>
            ) : (
              <div className="flex items-center text-xs text-gray-500 italic">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>{getRestrictionMessage()}</span>
              </div>
            )}

            {showGroomerDropdown && (
              <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search groomers..."
                      value={groomerSearch}
                      onChange={(e) => setGroomerSearch(e.target.value)}
                      className={`w-full p-3 pl-10 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition  `}
                    />
                  </div>

                  <button
                    onClick={() => navigate('/create-groomer')}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg text-sm font-medium text-blue-600 border border-blue-200 mb-2"
                  >
                    Create Groomer
                  </button>

                  <div className="max-h-40 overflow-y-auto">
                    {filteredGroomers.map((groomer) => (
                      <button
                        key={groomer.id}
                        onClick={() =>
                          handleGroomerAssignment(
                            booking.booking.id,
                            groomer.id
                          )
                        }
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="font-medium text-gray-900">
                          {groomer.groomer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {groomer.level}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </td>

      {/* OTP Status */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 w-12">Start:</span>
            {booking.booking.start_otp ? (
              <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded border">
                {booking.booking.start_otp}
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border">
                Not Generated
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 w-12">End:</span>
            {booking.booking.end_otp ? (
              <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded border">
                {booking.booking.end_otp}
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border">
                Not Generated
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;

