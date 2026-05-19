export interface Address {
  id: number;
  flat_no: string;
  floor: string | null;
  apartment_name: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  location: string;
  latitude: number;
  longitude: number;
  label: string;
  status: string;
  isDefault: boolean;
  special_instructions: string | null;
  createdat?: string;
  updatedat?: string;
}
import React from 'react';
import { MapPin, Home, Building, Edit, Trash } from 'lucide-react';
// import { Address } from '@/types/address'; // adjust path if needed

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
  onDelete?: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  showEditButton = false,
  onDelete,
}) => {
  const getIcon = () => {
    switch (address.label) {
      case 'Home':
        return <Home className="h-5 w-5 text-teal-600" />;
      case 'Work':
        return <Building className="h-5 w-5 text-teal-600" />;
      default:
        return <MapPin className="h-5 w-5 text-teal-600" />;
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-all
        ${
          isSelected
            ? 'border-teal-600 bg-teal-50'
            : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left side */}
        <div className="flex items-start space-x-3 min-w-0">
          <div className="bg-teal-100 p-2 rounded-lg flex-shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                {address.label}
              </h3>
              {address.isDefault && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-600 text-xs rounded-full truncate max-w-[100px]">
                  Default
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm break-words">
              {address.flat_no && `${address.flat_no}, `}
              {address.apartment_name && `${address.apartment_name}, `}
            </p>
            <p className="text-gray-600 text-sm break-words">
              {address.full_address}
            </p>
            <p className="text-gray-500 text-xs mt-1 break-words">
              {address.city && `${address.city}, `}
              {address.state && `${address.state} `}
              {address.pincode}
            </p>

            {(address.latitude || address.longitude) && (
              <p className="text-gray-400 text-xs mt-1 break-words">
                Coordinates: {address.latitude}, {address.longitude}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showEditButton && (onEdit || onDelete) && (
          <div className="flex justify-end sm:justify-center items-center space-x-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Edit className="h-4 w-4 text-teal-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Trash className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
