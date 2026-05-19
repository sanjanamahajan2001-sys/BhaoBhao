import React, { useState } from 'react';
import { CheckCircle, DogIcon, Edit, Trash } from 'lucide-react';
import calculatePetAge from '@/lib/calculatePetAge';
import { Pets } from '@/types/booking.type';
import { getImageUrl } from '@/utils/imageUtils';

interface PetCardProps {
  pet: Pets;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const profileImage =
    pet.photo_url && pet.photo_url.length > 0
      ? getImageUrl(pet.photo_url[0])
      : null;

  return (
    <div
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all
          ${
            isSelected
              ? 'border-teal-600 bg-teal-50'
              : 'border-gray-200 hover:border-gray-300'
          }
        `}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ${
            isSelected ? 'ring-2 ring-teal-600' : ''
          }`}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={pet.pet_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <DogIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {pet.pet_name}
          </h3>
          <p className="text-sm text-gray-600 break-words">
            {pet.breed_name || 'Unknown breed'} •{' '}
            {pet.pet_details?.pet_gender || 'Unknown gender'} •{' '}
            {calculatePetAge(pet.pet_dob)}
          </p>
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex space-x-2">
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

export default PetCard;
