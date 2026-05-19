import React from 'react';
import Modal from 'react-modal';
import { CreditCard, X } from 'lucide-react';
import { PaymentTransaction } from '../types';
import { formatDateTime } from '../utils/formatDateTime';

interface TransactionModalProps {
  showTransactionModal: any;
  setShowTransactionModal: any;
  booking: any;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  showTransactionModal,
  setShowTransactionModal,
  booking,
}) => {
  const isOpen = showTransactionModal === booking.booking.id;

  const total = booking.booking.total;
  const paid =
    booking.transactions?.reduce(
      (s: number, t: PaymentTransaction) => s + t.amount,
      0
    ) || 0;
  const balance = parseFloat((total - paid).toFixed(2));
  const fullyPaid = paid >= total;

  const handleRequestClose = () => {
    setShowTransactionModal(null);
  };

  const getPaymentStatus = () => {
    if (paid >= total) return { text: 'Fully Paid', color: 'text-green-600' };
    if (paid > 0)
      return {
        text: `Partially Paid (₹${paid} / ₹${total})`,
        color: 'text-orange-600',
      };
    return { text: 'Payment Pending', color: 'text-red-600' };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleRequestClose}
      contentLabel={`Transaction Details — Order #${booking.booking.order_id}`}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      className="relative w-full md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction Details — Order #{booking.booking.order_id}
          </h3>
          <button
            onClick={handleRequestClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Service Details */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Services</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Main: {booking.service?.service_name}</span>
              <span className="font-medium">₹{booking.service_pricing?.discounted_price || 0}</span>
            </div>
            {booking.addon_services && booking.addon_services.length > 0 && (
              <div className="border-t border-blue-200 pt-2 space-y-1">
                <div className="text-xs font-semibold text-blue-700 mb-1">Add-ons:</div>
                {booking.addon_services.map((addon: any) => (
                  <div key={addon.pricing_id} className="flex justify-between text-xs text-gray-600 ml-2">
                    <span>• {addon.service_name}</span>
                    <span className="font-medium">₹{addon.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}

        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          {/* Main Amount */}
          <div className="text-center border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500 mb-1">Order Total</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{total.toLocaleString()}
            </p>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CreditCard className="h-5 w-5" />
            <span className={`font-semibold ${paymentStatus.color}`}>
              {paymentStatus.text}
            </span>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-green-700 mb-1">Amount Paid</p>
              <p className="text-lg font-semibold text-green-800">
                ₹{paid.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <p className="text-xs text-red-700 mb-1">Balance Due</p>
              <p className="text-lg font-semibold text-red-800">
                ₹{balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-3 transition-all duration-300 ${
                fullyPaid ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-600">
            {Math.round((paid / total) * 100)}% Completed
          </p>
        </div>
        {/* Transaction History */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 mb-2">
            Transaction History
          </h4>
          {booking.transactions && booking.transactions.length > 0 ? (
            <div className="space-y-2">
              {booking.transactions.map((transaction: PaymentTransaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{transaction.amount}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                    {/* <p>ID: {transaction.id}</p> */}
                    <p>Method: {transaction.method}</p>
                    <p>Date: {formatDateTime(transaction?.createdat || '')}</p>
                    {transaction.notes && (
                      <p className="md:col-span-2">Note: {transaction.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No transactions found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleRequestClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionModal;

