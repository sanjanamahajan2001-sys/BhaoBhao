import React, { useState, useRef } from 'react';
import { CreditCard, IndianRupee, X } from 'lucide-react';
import { Booking } from '../types';

interface PaymentFormProps {
  booking: Booking;
  onPaymentAdded: () => void;
  onClose: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  booking,
  onPaymentAdded,
  onClose,
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'UPI' | 'Cash'>('UPI');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  const totalAmount = booking.booking.total || 0;
  const paidAmount =
    booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const pendingAmount = parseFloat((totalAmount - paidAmount).toFixed(2));

  const handleSubmit = async () => {
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > pendingAmount) {
      setError(`Amount cannot exceed pending amount of ₹${pendingAmount}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://45.79.126.9:5001';
      const apiKey =
        import.meta.env.VITE_API_KEY ||
        '89dfa480a72e611280022f968e162155_57cf7b8248fffe96';
      const token = sessionStorage.getItem('adminToken');

      const transactionData = {
        booking_id: booking.booking.id,
        amount: parseFloat(amount),
        method,
        notes: notes || (method === 'UPI' ? 'UPI payment' : 'Cash payment'),
      };

      const response = await fetch(`${API_BASE_URL}/transactions/newAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record payment');
      }

      // Success
      alert('Payment recorded successfully!');
      onPaymentAdded();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to record payment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200">
          <div className="space-y-2 text-sm text-blue-900">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Paid</span>
              <span className="font-semibold text-green-600">
                ₹{paidAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Pending</span>
              <span className="font-bold text-red-600">
                ₹{pendingAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* UPI Option */}
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
                  method === 'UPI'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard
                  size={20}
                  className={`mr-2 ${
                    method === 'UPI' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <span className="font-medium">UPI</span>
              </button>

              {/* Cash Option */}
              <button
                type="button"
                onClick={() => setMethod('Cash')}
                className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
                  method === 'Cash'
                    ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IndianRupee
                  size={20}
                  className={`mr-2 ${
                    method === 'Cash' ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <span className="font-medium">Cash</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={pendingAmount}
              min="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                method === 'UPI' ? 'UPI REF ID - 123456' : 'Cash payment notes'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


