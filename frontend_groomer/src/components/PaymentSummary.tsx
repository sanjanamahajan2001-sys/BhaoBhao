import React from 'react';
import { BookingData } from '../types';
import TransactionModal from './TransactionModal';

export const PaymentSummary: React.FC<{ booking: BookingData }> = ({
  booking,
}) => {
  const [showTransactionModal, setShowTransactionModal] = React.useState<
    number | null
  >(null);
  const totalAmount = booking.booking.total || 0;
  const paidAmount =
    booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const pendingAmount = parseFloat((totalAmount - paidAmount).toFixed(2));

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Payment Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-medium">₹{totalAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid Amount:</span>
          <span className="font-medium text-green-600">₹{paidAmount}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-900 font-medium">Pending Amount:</span>
          <span
            className={`font-semibold ${
              pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            ₹{pendingAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {booking.transactions && booking.transactions.length > 0 && (
        <div className="mt-4 overflow-x-auto flex justify-between gap-4 items-center">
          <h4 className="text-sm font-medium text-gray-900  ">
            Transaction History
          </h4>
          <button
            className="px-3 py-2 bg-gray-300 text-black text-sm rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => setShowTransactionModal(booking.booking.id)}
          >
            View
          </button>
          {/* <div className="space-y-2 min-w-[280px]">
            {booking.transactions.map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex justify-between items-center text-xs bg-white p-2 rounded border"
              >
                <div>
                  <span className="font-medium">{transaction.method}</span>
                  <span className="text-gray-500 ml-2">
                    ₹{transaction.amount}
                  </span>
                </div>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {transaction.status || 'Completed'}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      )}

      {showTransactionModal && (
        <TransactionModal
          showTransactionModal={showTransactionModal}
          setShowTransactionModal={setShowTransactionModal}
          booking={booking}
        />
      )}
    </div>
  );
};

