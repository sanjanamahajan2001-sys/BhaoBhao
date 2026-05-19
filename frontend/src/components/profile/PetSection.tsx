import React, { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import usePets, { Pet } from '@/hooks/pets/usePets';
import AddPetForm from '../booking/form/AddPetForm';
import PetCard from '../booking/ui/PetCard';
import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';
import Swal from 'sweetalert2';
import PetDetailsModal from './ViewPetModal';
// import { useQuery } from '@tanstack/react-query';
// import { fetchBookings } from '@/pages/BookingHistory';
export const mapPetToFormData = (pet: any) => {
  return {
    id: pet.id,
    pet_name: pet.pet_name ?? pet.pet_details?.pet_name ?? '',
    pet_gender: pet.pet_details?.pet_gender ?? 'Male',
    pet_type_id: pet.pet_details?.pet_type_id?.toString() ?? '1',
    breed_id: pet.pet_details?.breed_id?.toString() ?? '1',
    owner_name: pet.pet_details?.owner_name ?? '',
    pet_dob: pet.pet_dob ?? pet.pet_details?.pet_dob ?? '',
    pet_pic_url: pet.photo_url?.[0] ?? pet.pet_details?.photo_url?.[0] ?? null,
    nature: pet.nature ?? pet.pet_details?.nature ?? '',
    health_conditions:
      pet.health_conditions ?? pet.pet_details?.health_conditions ?? '',
  };
};
const PetSection: React.FC = () => {
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState<string | null>(null);
  const [initialPetData, setInitialPetData] = useState<any>(null);
  const [error, setError] = useState('');
  const [viewingPet, setViewingPet] = useState<Pet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = React.useRef<HTMLDivElement | null>(null);

  const {
    data: pets = [],
    isLoading: petsLoading,
    error: petsError,
    refetch,
  } = usePets();

  const handlePetAdded = async (newPet: any) => {
    console.log('Pet added:', newPet);
    await refetch();
    setShowPetForm(false);
    setEditingPet(null);
    setError('');
  };
  const handleViewPet = (pet: Pet) => {
    setViewingPet(pet);
    setIsModalOpen(true);
  };
  const handleEditPet = (pet: any) => {
    console.log('Editing pet:', pet);
    // if (upcomingPetIds.includes(pet.id)) {
    //   Swal.fire({
    //     icon: 'info',
    //     title: 'Pet cannot be Edited',
    //     text: 'This pet has an upcoming booking. Please cancel or complete the booking first.',
    //   });
    //   return;
    // }
    const cleanedPet = mapPetToFormData(pet);

    setInitialPetData(cleanedPet); // 👈 pass this as initialPet
    setEditingPet(pet.id);
    setShowPetForm(true);

    // 👇 scroll to form after a small delay so it renders first
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // const { data: bookings = [] } = useQuery({
  //   queryKey: ['bookings-pets'],
  //   queryFn: fetchBookings,
  //   staleTime: 1000 * 60 * 5,
  // });

  // Filter upcoming bookings
  // const upcomingPetIds = React.useMemo(() => {
  //   const now = new Date();
  //   return Array.from(
  //     new Set(
  //       bookings
  //         .filter((b) => new Date(b.booking.appointment_time_slot) >= now)
  //         .map((b) => b.pet.id)
  //     )
  //   );
  // }, [bookings]);
  // console.log('Upcoming pet IDs:', upcomingPetIds);
  const handleDeletePet = async (petId: number) => {
    // 🔹 Check if pet has an upcoming booking
    // if (upcomingPetIds.includes(petId)) {
    //   Swal.fire({
    //     icon: 'info',
    //     title: 'Pet cannot be deleted',
    //     text: 'This pet has an upcoming booking. Please cancel or complete the booking first.',
    //   });
    //   return;
    // }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Pet will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/pets/${petId}`);
      await refetch();
      toast.success('Pet deleted successfully');
    } catch (err: any) {
      // setError('Failed to delete pet');
      console.error('Failed to delete pet:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to delete pet. Try again.'
      );
    }
  };
  const handleCancel = () => {
    setShowPetForm(false);
    setEditingPet(null);
    setError('');
  };

  if (petsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
      <div className="flex sm:items-center gap-4 max-sm:flex-col  justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Pets</h2>
        <button
          onClick={() => setShowPetForm(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-black text-black bg-white rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Pet</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6">
          {error}
        </div>
      )}

      {petsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6">
          Error loading pets. Please try again.
        </div>
      )}

      {showPetForm && (
        <div ref={formRef}>
          <AddPetForm
            editingPetId={editingPet}
            initialPet={initialPetData}
            onPetAdded={handlePetAdded}
            onCancel={handleCancel}
          />
        </div>
      )}

      {pets.length === 0 && !showPetForm ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No pets added yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first pet to start booking grooming services
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={() => handleEditPet(pet)}
              onDelete={() => handleDeletePet(pet.id)} // ✅ confirm modal here
              showActions={true}
              onSelect={() => handleViewPet(pet)}
            />
          ))}
        </div>
      )}
      {/* Pet Details Modal */}
      <PetDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pet={viewingPet}
      />
    </div>
  );
};

export default PetSection;

