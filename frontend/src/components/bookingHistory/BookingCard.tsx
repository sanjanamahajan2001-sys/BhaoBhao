import React from 'react';
import { Clock, MapPin, Calendar, Timer, CreditCard, Hash } from 'lucide-react';
import { BookingData } from '@/types/bookingHistory.type';
import {
  formatDate,
  formatDateTime,
  formatTime,
  getStatusColor,
  getStatusIcon,
} from '@/utils/bookingHistory.utils';
// Add these functions to the existing bookingUtils.ts file

export const calculateTotalPaid = (transactions: any[]): number => {
  return transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
};

export const calculateBalance = (
  total: number,
  transactions: any[]
): number => {
  return total - calculateTotalPaid(transactions);
};
interface BookingCardProps {
  bookingData: BookingData;
  type: 'upcoming' | 'past';
  onShowTransactionModal: (bookingId: number) => void;
  bookingActions: {
    handleCancel: (bookingId: number) => Promise<void>;
    handleReschedule: (bookingData: BookingData) => void;
    isLoading: boolean;
  };
}

export const BookingCard: React.FC<BookingCardProps> = ({
  bookingData,
  type,
  onShowTransactionModal,
  bookingActions,
}) => {
  const { booking, pet, service, servicepricing, address, transactions } =
    bookingData;
  const StatusIcon = getStatusIcon(booking.status);
  const statusColor = getStatusColor(booking.status);
  const isUpcoming = type === 'upcoming';
  const totalPaid = calculateTotalPaid(transactions || []);
  const balance = calculateBalance(booking.total, transactions || []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Header */}
        <div className="p-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {service.servicename}
            </h3>
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}
            >
              <StatusIcon className="h-3 w-3" />
              <span className="capitalize">{booking.status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            For {pet?.petname}
          </p>
          <button
            onClick={() => onShowTransactionModal(booking.id)}
            className="text-xs text-gray-500 mt-1 flex items-center hover:bg-slate-100 cursor-pointer"
          >
            <Hash className="h-3 w-3 mr-1" />
            {booking.orderid}
          </button>
        </div>

        {/* Date & Time Card */}
        <div className="p-4 pb-3 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <Calendar className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {formatDate(booking.appointmenttimeslot)}
                </p>
                <p className="text-xs text-gray-600">
                  {formatTime(booking.appointmenttimeslot)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-teal-700 text-lg">
                ₹{booking.total}
              </p>
              <p className="text-xs text-gray-500">
                {service.durationminutes} mins
              </p>
            </div>
          </div>

          {/* Total/Paid/Balance */}
          <div className="mt-1 text-xs text-gray-600 space-y-0.5">
            <p>
              Total: <span className="font-medium">₹{booking.total}</span>
            </p>
            <p>
              Paid:{' '}
              <span className="font-medium text-green-600">₹{totalPaid}</span>
            </p>
            <p>
              Balance:{' '}
              <span className="font-medium text-red-600">₹{balance}</span>
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 pt-3 space-y-2">
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="h-3 w-3 mr-2 text-gray-400" />
            <span className="truncate">{address?.label}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <CreditCard className="h-3 w-3 mr-2 text-gray-400" />
            <span>{booking.paymentmethod}</span>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="px-4 pb-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          </div>
        )}

        {/* OTP Section */}
        <div className="px-4 pb-3">
          <div className="flex justify-between text-xs">
            <div className="bg-gray-50 px-2 py-1 rounded">
              <span className="font-medium text-gray-600">Start OTP:</span>
              <span className="ml-1 font-mono text-teal-700">
                {booking.startotp || 'NA'}
              </span>
            </div>
            <div className="bg-gray-50 px-2 py-1 rounded">
              <span className="font-medium text-gray-600">End OTP:</span>
              <span className="ml-1 font-mono text-teal-700">
                {booking.endotp || 'NA'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 mt-2">
            <span>Booked on {formatDateTime(booking.createdat)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Transaction button */}
            <button
              className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
              onClick={() => onShowTransactionModal(booking.id)}
            >
              <CreditCard className="h-3 w-3" />
              Transactions
            </button>

            {isUpcoming && booking.status !== 'Cancelled' && (
              <button
                className="flex-1 py-2 px-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                onClick={() => bookingActions.handleReschedule(bookingData)}
              >
              Edit Booking
              </button>
            )}

            {isUpcoming && booking.status !== 'Cancelled' && (
              <button
                className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                onClick={() => bookingActions.handleCancel(booking.id)}
                disabled={bookingActions.isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-6">
        <div className="flex gap-4">
          {/* Date Box */}
          <div className="flex-shrink-0 gap-4 flex flex-col">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-4 text-center w-full border border-teal-100">
              <div className="text-teal-800 font-bold text-xl">
                {new Date(booking.appointmenttimeslot).getDate()}
              </div>
              <div className="text-teal-600 text-xs uppercase font-medium">
                {new Date(booking.appointmenttimeslot).toLocaleString('en-US', {
                  month: 'short',
                })}
              </div>
              <div className="text-teal-500 text-xs">
                {new Date(booking.appointmenttimeslot).getFullYear()}
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColor}`}
            >
              <StatusIcon className="h-4 w-4" />
              <span className="capitalize">{booking.status}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                  {service.servicename}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  For {pet?.petname} • {servicepricing?.groomerlevel} Groomer
                </p>
                <button
                  onClick={() => onShowTransactionModal(booking.id)}
                  className="text-xs text-gray-500 mt-1 flex items-center hover:bg-slate-100 cursor-pointer"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {booking.orderid}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{booking.total}
                  </p>
                  {/* Total/Paid/Balance */}
                  <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                    <p>
                      Paid:{' '}
                      <span className="font-medium text-green-600">
                        ₹{totalPaid}
                      </span>
                    </p>
                    <p>
                      Balance:{' '}
                      <span className="font-medium text-red-600">
                        ₹{balance}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{formatTime(booking.appointmenttimeslot)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{address?.label}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span>{booking.paymentmethod}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Timer className="h-4 w-4 text-gray-400" />
                <span>{service.durationminutes} minutes</span>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mb-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 w-full justify-between">
              <div className="bg-gray-50 px-3 py-1 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">
                  Start OTP:
                </span>
                <span className="ml-2 font-mono text-teal-700 font-medium">
                  {booking.startotp || 'NA'}
                </span>
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">
                  End OTP:
                </span>
                <span className="ml-2 font-mono text-teal-700 font-medium">
                  {booking.endotp || 'NA'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-500">
                  Booked on {formatDateTime(booking.createdat)}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {/* Transaction button */}
                <button
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200 flex items-center gap-2"
                  onClick={() => onShowTransactionModal(booking.id)}
                >
                  <CreditCard className="h-4 w-4" />
                  Transactions
                </button>

                {isUpcoming && booking.status !== 'Cancelled' && (
                  <button
                    className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors border border-teal-200"
                    onClick={() => bookingActions.handleReschedule(bookingData)}
                  >
                  Edit Booking
                  </button>
                )}

                {isUpcoming && booking.status !== 'Cancelled' && (
                  <button
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                    onClick={() => bookingActions.handleCancel(booking.id)}
                    disabled={bookingActions.isLoading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
