import React, { useState } from 'react';
import {
  Plus,
  User,
  Calendar,
  Scissors,
  Play,
  CheckCircle,
  Phone,
  MapPin,
  Clipboard,
  Clock,
} from 'lucide-react';
import { BookingData } from '../types';
import { PaymentSummary } from './PaymentSummary';
import { PaymentForm } from './PaymentForm';
import { BookingStatusTimeline } from './BookingStatusTimeline';
import { OTPModal } from './OTPModal';

export const BookingCard: React.FC<{
  booking: BookingData;
  onStatusUpdate: () => void;
}> = ({ booking, onStatusUpdate }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpAction, setOtpAction] = useState<'start' | 'complete'>('start');

  const totalAmount = booking.booking.total || 0;
  const paidAmount =
    booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const pendingAmount = parseFloat((totalAmount - paidAmount).toFixed(2));

  const handleStartBooking = () => {
    setOtpAction('start');
    setShowOTPModal(true);
  };

  const handleCompleteBooking = () => {
    setOtpAction('complete');
    setShowOTPModal(true);
  };

  const handleOTPSuccess = () => {
    // Auto-update the bookings list
    onStatusUpdate();
    setShowOTPModal(false);
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '—';
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (years > 0) {
      return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
    } else {
      return months > 0 ? `${months} mo` : 'Newborn';
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    const parts = [];
    const buildingInfo = [
      address.flat_no?.trim(),
      address.floor ? `${address.floor} Floor` : null,
      address.apartment_name?.trim()
    ].filter(Boolean).join(', ');

    if (buildingInfo) parts.push(buildingInfo);
    if (address.full_address?.trim()) parts.push(address.full_address.trim());
    if (address.pincode?.trim()) parts.push(address.pincode.trim());

    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  const getActionButton = () => {
    switch (booking.booking.status) {
      case 'Scheduled':
        return (
          <button
            onClick={handleStartBooking}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Play size={16} className="mr-1" />
            Start Service
          </button>
        );
      case 'In Progress':
        return (
          <button
            onClick={handleCompleteBooking}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={16} className="mr-1" />
            Complete Service
          </button>
        );
      case 'Completed':
        return null; // No action button for completed bookings
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          {/* Left section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 break-words">
                {booking.pet?.pet_name || 'Pet Name'}
              </h3>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase rounded-md border border-teal-200">
                {booking.pet_type?.name || 'Pet'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Order ID: <span className="text-gray-700">{booking.booking.order_id}</span>
            </p>
            {booking.booking.createdat && (
              <p className="text-[10px] text-gray-400 mt-1">
                Booked at: {new Date(booking.booking.createdat).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Right section */}
          <div className="flex flex-col items-start md:items-end space-y-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${booking.booking.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : booking.booking.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}
            >
              Booking: {booking.booking.status}
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${pendingAmount > 0
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
                }`}
            >
              {pendingAmount > 0 ? 'Payment: Pending' : 'Fully Paid'}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <User size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-600">Customer:</span>
              <span className="ml-auto font-medium break-words">
                {booking.customer?.customer_name}
              </span>
            </div>

            <div className="ml-6 flex flex-col space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center text-xs text-gray-700">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Phone size={10} className="text-blue-600" />
                </div>
                <span className="font-medium">{booking.customer?.mobile_number || 'No phone'}</span>
              </div>
              <div className="flex items-start text-xs text-gray-700">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <MapPin size={10} className="text-red-600" />
                </div>
                <span className="break-words leading-relaxed pt-0.5">
                  {formatAddress(booking.address)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <Clipboard size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-600">Pet Details:</span>
            </div>
            <div className="ml-6 grid grid-cols-2 gap-x-4 gap-y-1 bg-teal-50 p-2 rounded border border-teal-100">
              <div className="text-xs text-gray-700">
                <span className="text-gray-500">Type:</span> {booking.pet_type?.name || '—'}
              </div>
              <div className="text-xs text-gray-700">
                <span className="text-gray-500">Age:</span> {calculateAge(booking.pet?.pet_dob)}
              </div>
              <div className="text-xs text-gray-700">
                <span className="text-gray-500">Gender:</span> {booking.pet?.pet_gender || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2">
                <span className="text-gray-500">Breed:</span> {booking.pet_breed?.breed_name || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2">
                <span className="text-gray-500">Skin:</span> {booking.pet?.skin_condition || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2">
                <span className="text-gray-500">Nature:</span> {booking.pet?.nature || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2">
                <span className="text-gray-500">Health:</span> {booking.pet?.health_conditions || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2">
                <span className="text-gray-500">Pet Comments:</span> {booking.pet?.comments || '—'}
              </div>
              <div className="text-xs text-gray-700 col-span-2 italic">
                <span className="text-gray-500 not-italic">Notes:</span> {booking.booking?.notes || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center border-t border-gray-50 pt-3">
            <Scissors size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Service:</span>
            <div className="ml-auto text-right">
              <div className="font-bold text-gray-900 break-words">
                {booking.service?.service_name}
              </div>
              <div className="flex items-center justify-end text-[10px] text-gray-500 font-medium mt-0.5">
                <Clock size={10} className="mr-1" />
                <span>Approx. {booking.service?.duration_minutes || booking.service_pricing?.duration_minutes || '—'} minutes</span>
              </div>
            </div>
          </div>

          {booking.addon_services && booking.addon_services.length > 0 && (
            <div className="ml-6 bg-blue-50 p-2 rounded border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 mb-1">
                Add-on Services:
              </div>
              {booking.addon_services.map((addon) => (
                <div
                  key={addon.pricing_id}
                  className="text-xs text-gray-700 flex justify-between"
                >
                  <span>• {addon.service_name}</span>
                  <span className="font-medium">₹{addon.price}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center flex-wrap">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Scheduled:</span>
            <span className="ml-auto font-medium">
              {new Date(booking.booking.appointment_time_slot).toLocaleString()}
            </span>
          </div>

        </div>

        {/* Status Timeline */}
        <div className="mb-4">
          <BookingStatusTimeline booking={booking} />
        </div>

        {/* Payment Summary */}
        <PaymentSummary booking={booking} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-100 gap-3">
          <div className="text-sm">
            {pendingAmount > 0 ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                ₹{pendingAmount.toFixed(2)} pending
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Fully paid
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {pendingAmount > 0 && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Payment
              </button>
            )}

            {getActionButton()}
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          booking={booking}
          onPaymentAdded={onStatusUpdate}
          onClose={() => setShowPaymentForm(false)}
        />
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          booking={booking}
          action={otpAction}
          onClose={() => setShowOTPModal(false)}
          onSuccess={handleOTPSuccess}
        />
      )}
    </>
  );
};

