import React, { useState } from 'react';
import { User, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AddressSection from '@/components/profile/AddressSection';
import PetSection from '@/components/profile/PetSection';
import ProfileForm from '@/components/profile/ProfileForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!editing ? (
        <>
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 flex items-center justify-between">
            <div className="flex sm:items-center max-sm:flex-col gap-4 space-x-4 truncate">
              <div className="bg-teal-100 p-2 rounded-2xl w-fit flex-shrink-0">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.full_name}
                    className="w-20 h-20 object-cover rounded-2xl shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.full_name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {user?.full_name || 'Profile'}
                </h1>
                <p className="text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 text-teal-600" />
            </button>
          </div>

          {/* Addresses Section */}
          <AddressSection />

          {/* Pets Section */}
          <PetSection />
        </>
      ) : (
        <ProfileForm onCancel={() => setEditing(false)} />
      )}
    </div>
  );
};

export default Profile;
