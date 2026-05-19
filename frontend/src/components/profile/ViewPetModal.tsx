import React from 'react';
import Modal from 'react-modal';
import {
  X,
  Dog,
  Cat,
  Calendar,
  User,
  MapPin,
  Scissors,
  Heart,
} from 'lucide-react';
import { Pet } from '@/hooks/pets/usePets';
import calculatePetAge from '@/lib/calculatePetAge';
import { formatPrettyDate } from '../booking/ScheduleStep';

Modal.setAppElement('#root');

interface PetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | null;
}

const PetDetailsModal: React.FC<PetDetailsModalProps> = ({
  isOpen,
  onClose,
  pet,
}) => {
  if (!pet) return null;

  const profileImage =
    pet.photo_url && pet.photo_url.length > 0
      ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${pet.photo_url[0]}`
      : null;

  const getPetIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cat':
        return <Cat className="h-5 w-5" />;
      case 'dog':
      default:
        return <Dog className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'deceased':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  console.log('pet', { pet });
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Pet Details"
      className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-0 relative mx-auto my-8 outline-none overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      closeTimeoutMS={300}
    >
      {/* Header with image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-50 to-indigo-50">
        {profileImage ? (
          <img
            src={profileImage}
            alt={pet.pet_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {getPetIcon(pet.pet_type_obj?.name || '')}
            <span className="sr-only">{pet.pet_name}</span>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Status badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            pet.status
          )}`}
        >
          {pet.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Pet name and basic info */}
        <div className="flex flex-col items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{pet.pet_name}</h2>
          <div className="flex items-center mt-2 text-gray-600">
            {getPetIcon(pet.pet_type_obj?.name || '')}
            <span className="ml-2">
              {pet.pet_breed_obj?.breed_name || 'Unknown Breed'} •{' '}
              {pet.pet_details?.pet_gender || 'Unknown'}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {calculatePetAge(pet.pet_dob)} old
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Owner</p>
              <p className="text-gray-900">
                {pet.pet_details?.owner_name || 'N/A'}
              </p>
            </div>
          </div> */}

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-gray-900">
                {/* {new Date(pet.pet_dob).toLocaleDateString()} */}
                {formatPrettyDate(pet.pet_dob)}
              </p>
            </div>
          </div>

          {pet.pet_breed_obj?.origin && (
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Breed Origin
                </p>
                <p className="text-gray-900">{pet.pet_breed_obj.origin}</p>
              </div>
            </div>
          )}

          {pet.pet_breed_obj?.grooming_needs && (
            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <Scissors className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Grooming Needs
                </p>
                <p className="text-gray-900">
                  {pet.pet_breed_obj.grooming_needs}
                </p>
              </div>
            </div>
          )}
          {/* NEW: Nature */}
          {pet?.pet_details?.nature && (
            <div className="flex items-start">
              <div className="bg-pink-100 p-2 rounded-lg mr-3">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nature</p>
                <p className="text-gray-900">{pet.pet_details.nature}</p>
              </div>
            </div>
          )}

          {/* NEW: Health Conditions */}
          {pet?.pet_details?.health_conditions && (
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Health Conditions
                </p>
                <p className="text-gray-900">
                  {pet.pet_details.health_conditions}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Additional information if available */}
        {(pet.pet_breed_obj?.group_name || pet.pet_breed_obj?.origin) && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <Heart className="h-5 w-5 text-pink-500 mr-2" />
              Breed Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              {pet.pet_breed_obj?.group_name && (
                <p>Group: {pet.pet_breed_obj.group_name}</p>
              )}
              {pet.pet_breed_obj?.origin && (
                <p>Origin: {pet.pet_breed_obj.origin}</p>
              )}
            </div>
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-gray-400 mt-6">
          Added on{' '}
          {new Date(
            pet.pet_details?.createdat || Date.now()
          ).toLocaleDateString()}
        </div>
      </div>
    </Modal>
  );
};

export default PetDetailsModal;
