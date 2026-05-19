import React, { useState, useRef } from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import { BookingData } from '../types';
import { bookingService } from '../services/api';
import toast from 'react-hot-toast';

interface OTPModalProps {
  booking: BookingData;
  action: 'start' | 'complete';
  onSuccess: () => void;
  onClose: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  booking,
  action,
  onSuccess,
  onClose,
}) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsSubmitting(true);

    try {
      if (action === 'start') {
        await bookingService.startBooking(booking.booking.id, {
          start_otp: otp,
        });
        toast.success('Booking started successfully!');
      } else {
        await bookingService.completeBooking(booking.booking.id, {
          end_otp: otp,
        });
        toast.success('Booking completed successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage =
        error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const isStartAction = action === 'start';
  const expectedOtp = isStartAction
    ? booking.booking.start_otp
    : booking.booking.end_otp;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()} // Prevent inside clicks from bubbling up
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {isStartAction ? (
              <Clock size={20} className="text-blue-600 mr-2" />
            ) : (
              <CheckCircle size={20} className="text-green-600 mr-2" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {isStartAction ? 'Start Booking' : 'Complete Booking'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{booking.booking.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pet:</span>
              <span className="font-medium">{booking.pet?.pet_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">
                {booking.customer?.customer_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">
                {booking.service?.service_name}
              </span>
            </div>
          </div>
        </div>

        {/* OTP Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isStartAction ? 'Start OTP' : 'End OTP'}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-3 py-2 text-center text-lg font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Enter the {isStartAction ? 'start' : 'end'} OTP to{' '}
              {isStartAction ? 'begin' : 'complete'} this booking.
              {expectedOtp && (
                <span className="block font-semibold text-blue-600 mt-1">
                  (Demo Mode Copy-Paste: {expectedOtp})
                </span>
              )}
            </p>
          </div>

          {/* Action Description */}
          <div
            className={`p-3 rounded-lg ${
              isStartAction ? 'bg-blue-50' : 'bg-green-50'
            }`}
          >
            <p
              className={`text-sm ${
                isStartAction ? 'text-blue-800' : 'text-green-800'
              }`}
            >
              {isStartAction
                ? 'Once you enter the correct start OTP, the booking status will change to "In Progress" and the service timer will begin.'
                : 'Once you enter the correct end OTP, the booking will be marked as "Completed" and you can proceed with payment collection.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !otp}
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isStartAction
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting
                ? isStartAction
                  ? 'Starting...'
                  : 'Completing...'
                : isStartAction
                ? 'Start Booking'
                : 'Complete Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
