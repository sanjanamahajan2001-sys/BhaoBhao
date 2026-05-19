'use client';

import type React from 'react';
import { Plus, Heart } from 'lucide-react';
// import AddPetForm from './form/AddPetForm';
// import PetCard from './ui/PetCard';
import usePets from '@/hooks/pets/usePets';
import type { Pets } from '@/types/booking.type';
import PetCard from '../ui/PetCard';
import AddPetForm from '../form/AddPetForm';

interface MultiPetStepProps {
  selectedPets: Pets[];
  onPetToggle: (pet: Pets) => void;
  onShowAddPet: () => void;
  onHideAddPet: () => void;
  showAddPet: boolean;
  loading: boolean;
}

const MultiPetStep: React.FC<MultiPetStepProps> = ({
  selectedPets,
  onPetToggle,
  onShowAddPet,
  onHideAddPet,
  showAddPet,
  loading,
}) => {
  const {
    data: pets = [],
    isLoading: petsLoading,
    error: petsError,
    refetch,
  } = usePets();

  // Handle successful pet addition
  const handleAddPet = async (petData: any) => {
    await refetch();
    if (petData?.data?.id) {
      onPetToggle(petData.data);
    }
  };

  if (petsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading your pets...</div>
        </div>
      </div>
    );
  }

  if (petsError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">
            Error loading pets. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Select Your Pets
        </h2>
        <p className="text-gray-600 text-sm">
          You can select multiple pets for the services
        </p>
      </div>

      {/* Add Pet Form */}
      {showAddPet && (
        <AddPetForm
          onPetAdded={handleAddPet}
          onCancel={onHideAddPet}
          loading={loading}
        />
      )}

      {/* No Pets */}
      {pets.length === 0 && !showAddPet ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pets found
            </h3>
            <p className="text-gray-500 mb-4">
              Please add a pet to continue with booking
            </p>
            <button
              onClick={onShowAddPet}
              className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-black text-black bg-white rounded-xl hover:bg-gray-50 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add a new Pet</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Your Pets</h3>
            <div className="text-sm text-gray-600">
              {selectedPets.length} selected
            </div>
          </div>

          <div className="space-y-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isSelected={selectedPets.some((p) => p.id === pet.id)}
                onSelect={() => onPetToggle(pet)}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onShowAddPet}
              className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-black text-black bg-white rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add a new Pet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiPetStep;

