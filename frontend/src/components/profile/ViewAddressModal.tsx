import React from 'react';
import Modal from 'react-modal';
import {
  MapPin,
  Home,
  Building,
  X,
  Navigation,
  Map,
  Mailbox,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Address } from '../booking/ui/AddressCard';

Modal.setAppElement('#root');

interface ViewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null;
}

const ViewAddressModal: React.FC<ViewAddressModalProps> = ({
  isOpen,
  onClose,
  address,
}) => {
  if (!address) return null;

  const getIcon = () => {
    switch (address.label) {
      case 'Home':
        return <Home className="h-6 w-6 text-blue-600" />;
      case 'Work':
        return <Building className="h-6 w-6 text-indigo-600" />;
      default:
        return <MapPin className="h-6 w-6 text-teal-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="View Address"
      className="bg-white max-w-md w-full mx-auto rounded-2xl shadow-xl outline-none overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
      closeTimeoutMS={300}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm">{getIcon()}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{address.label}</h2>
            <div className="flex items-center mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  address.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {address.status === 'Active' ? (
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                )}
                {address.status}
              </span>

              {address.isDefault && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Address Details */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 flex items-center">
            <MapPin className="h-5 w-5 text-blue-500 mr-2" />
            Address Details
          </h3>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              {address.flat_no && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    Flat No:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {address.flat_no}
                  </span>
                </div>
              )}

              {address.apartment_name && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    Apartment:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {address.apartment_name}
                  </span>
                </div>
              )}

              <div className="flex">
                <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                  Address:
                </span>
                <span className="text-gray-900 font-medium">
                  {address.full_address}
                </span>
              </div>

              <div className="flex">
                <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                  Pincode:
                </span>
                <span className="text-gray-900 font-medium flex items-center">
                  <Mailbox className="h-4 w-4 mr-1 text-gray-400" />
                  {address.pincode}
                </span>
              </div>

              {address.floor && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    Floor:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {address.floor}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        {(address.latitude || address.longitude || address.location) && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700 flex items-center">
              <Navigation className="h-5 w-5 text-blue-500 mr-2" />
              Location Information
            </h3>

            <div className="bg-gray-50 rounded-lg p-4">
              {address.location && (
                <div className="flex mb-2">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    Area:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {address.location}
                  </span>
                </div>
              )}

              {(address.latitude || address.longitude) && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    Coordinates:
                  </span>
                  <span className="text-gray-900 font-medium flex items-center">
                    <Map className="h-4 w-4 mr-1 text-gray-400" />
                    {address.latitude && address.longitude
                      ? `${address.latitude}, ${address.longitude}`
                      : 'Not specified'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {address.special_instructions && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Special Instructions</h3>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                {address.special_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {formatDate(address?.createdat || '')}</p>
            <p>Last updated: {formatDate(address?.updatedat || '')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAddressModal;
