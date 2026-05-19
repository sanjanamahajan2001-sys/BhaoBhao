import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useAddresses } from '@/hooks/address/useAddresses';
import AddAddressForm from '../booking/form/AddAddressForm';
import AddressCard, { Address } from '../booking/ui/AddressCard';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import ViewAddressModal from './ViewAddressModal';
// import { useQuery } from '@tanstack/react-query';
// import { fetchBookings } from '@/pages/BookingHistory';

const AddressSection: React.FC = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [error, setError] = useState('');

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
    refetch,
  } = useAddresses();
  const [viewingAddress, setViewingAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAddress = (address: Address) => {
    setViewingAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (id: string | number) => {
    // 🔹 Block delete if this address is in an upcoming booking
    // if (upcomingAddressIds.includes(Number(id))) {
    //   Swal.fire({
    //     icon: 'info',
    //     title: 'Address cannot be deleted',
    //     text: 'This address is linked to an upcoming booking. Please cancel or complete the booking first.',
    //   });
    //   return;
    // }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This address will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/addresses/${id}`);
      await refetch();
      toast.success('Address deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete address:', err);
      toast.error(
        err?.response?.data?.message ||
          'Failed to delete address. Please try again.'
      );
    }
  };

  const handleAddressAdded = async (newAddress: any) => {
    console.log('Address added:', newAddress);

    await refetch();
    setShowAddressForm(false);
    setEditingAddress(null);
    setError('');
  };

  const handleEditAddress = (address: any) => {
    // 🔹 Block delete if this address is in an upcoming booking
    // if (upcomingAddressIds.includes(Number(address.id))) {
    //   Swal.fire({
    //     icon: 'info',
    //     title: 'Address cannot be Edited',
    //     text: 'This address is linked to an upcoming booking. Please cancel or complete the booking first.',
    //   });
    //   return;
    // }
    setEditingAddress(address.id);
    setShowAddressForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleCancel = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setError('');
  };

  if (addressesLoading) {
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
      <div className="flex sm:items-center justify-between mb-6 max-sm:flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Address</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-black text-black bg-white rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Address</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6">
          {error}
        </div>
      )}

      {addressesError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6">
          Error loading addresses. Please try again.
        </div>
      )}

      {showAddressForm && (
        <AddAddressForm
          editingAddressId={editingAddress}
          initialData={addresses.find(
            (a) => Number(a.id) === Number(editingAddress)
          )}
          onAddAddress={handleAddressAdded}
          onCancel={handleCancel}
        />
      )}

      {addresses.length === 0 && !showAddressForm ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No address found
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first address to manage your locations
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEditAddress(address)}
              onDelete={() => handleDeleteAddress(address.id)}
              showEditButton={true}
              onSelect={() => handleViewAddress(address)}
            />
          ))}
        </div>
      )}
      <ViewAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={viewingAddress}
      />
    </div>
  );
};

export default AddressSection;

