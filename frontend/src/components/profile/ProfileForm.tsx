import React, { useEffect, useState } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface UserInfo {
  full_name: string;
  phone_number: string;
  dob: string;
  profile_image: string | null;
  gender: string;
  email?: string;
  role?: string;
}

interface SaveProfileResponse {
  profile_image?: string;
}
// Utility regex for alphabets + spaces
// const NAME_REGEX = /^[A-Za-z\s]+$/;
const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
// Utility regex for validating email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ProfileForm = ({ onCancel }: { onCancel?: () => void }) => {
  const [formData, setFormData] = useState<UserInfo>({
    full_name: '',
    phone_number: '',
    email: '',
    dob: '',
    profile_image: null,
    gender: 'male',
  });

  const [profileImage, setProfileImage] = useState<string | undefined>('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [dob, setDob] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/profile/view"); // <-- correct endpoint
        const data = res.data?.data || res.data; // adjust if your API wraps data

        setFormData({
          full_name: data.customer_name || "",
          phone_number: data.mobile_number || "",
          dob: data.dob ? data.dob.slice(0, 10) : "",
          gender: data.gender || "male",
          profile_image: data.profile_image || null,
          email: data.email_id || "",       // ✅ picks real email field from DB
        });

        setProfileImage(data.profile_image || undefined);

        if (data.dob) setDob(new Date(data.dob));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  console.log(formData);
  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files?.[0];
    // ✅ Ensure only images are allowed
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (jpg, png, etc.)');
      e.target.value = ''; // clear the input
      return;
    }

    // (Optional) Limit size, e.g., 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 5MB');
      e.target.value = '';
      return;
    }

    if (file) {
      setProfileFile(file);
      setProfileImage(URL.createObjectURL(file));
      // reset so you can select same file again after delete
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(undefined);
    setProfileFile(null);
    setRemoveImage(true); // ✅ mark as deleted
  };

  const validateDob = (date: Date) => {
    const today = new Date();
    const minDate = new Date('1900-01-01');

    // Reject too old / unrealistic dates
    if (date < minDate) return false;

    const age = today.getFullYear() - date.getFullYear();
    const hasHadBirthday =
      today.getMonth() > date.getMonth() ||
      (today.getMonth() === date.getMonth() &&
        today.getDate() >= date.getDate());

    const actualAge = hasHadBirthday ? age : age - 1;
    return actualAge >= 18;
  };

  const handleSaveProfile = async () => {
    // ✅ Full Name validation
    if (!NAME_REGEX.test(formData.full_name)) {
      toast.error(
        'Full Name can only contain letters and spaces (no leading/trailing)'
      );
      return;
    }
    if (!formData.full_name || !formData.gender) {
      toast.error('Please fill all required fields');
      return;
    }
    // inside handleSaveProfile
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.full_name.length > 50) {
      toast.error('Full Name cannot exceed 50 characters');
      return;
    }

    // if (!validateDob(dob!)) {
    //   toast.error(
    //     'Please enter a valid Date of Birth (must be >= 1900 & 18+ years old)'
    //   );
    //   return;
    // }

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('customer_name', formData.full_name);
      form.append('dob', formData.dob);
      form.append('gender', formData.gender);
      //  EMAIL
      form.append('email_id', formData.email); // instead of hardcoding

      formData.phone_number &&
        form.append('phone_number', formData.phone_number);
      if (profileFile) {
        form.append('profile_pic', profileFile);
        form.append('remove_profile_image', 'false'); // new file overrides
      } else {
        form.append('remove_profile_image', removeImage ? 'true' : 'false');
      }

      const response = await axiosInstance.post<SaveProfileResponse>(
        '/profile/save',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response?.data?.profile_image) {
        setProfileImage(response.data.profile_image);
      }

      toast.success('Profile saved successfully');

      localStorage.setItem(
        'bhaobhao_user',
        JSON.stringify({
          ...formData,
          profile_image: response.data.profile_image,
        })
      );
      // sessionStorage.setItem(
      //   'bhaobhao_user',
      //   JSON.stringify({
      //     ...formData,
      //     profile_image: response.data.profile_image,
      //   })
      // );

      setUser({
        ...formData,
        profile_image: response?.data.profile_image || null,
      });

      // If onCancel is provided (used in modal), call it. Otherwise navigate to booking page
      if (onCancel) {
        onCancel();
      } else {
        // After completing profile, go to booking page
        navigate('/booking');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Profile photo */}
      <div className="flex flex-col items-center">
        {/* <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo
        </label> */}
        <div className="relative inline-block">
          {profileImage ? (
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="h-36 w-36 rounded-xl object-cover border"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center h-36 w-36 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-500 transition">
              <span className="text-gray-500 text-sm">Upload</span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter full name"
          maxLength={50}
        />
      </div>

      {/* TODO: ADD LATER  Phone number (read only) */}
      {formData.phone_number && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={formData.phone_number}
            disabled
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
          />
        </div>
      )}
      {/* Email  */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth{' '}
          <span className="text-gray-500 text-xs">(OPTIONAL)</span>
        </label>
        <input
          type="date"
          value={formData.dob}
          onChange={(e) => {
            const d = new Date(e.target.value);
            // if (!validateDob(d)) {
            //   toast.error('You must be at least 18 years old');
            //   return;
            // }
            setDob(d);
            handleInputChange('dob', e.target.value);
          }}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="w-full p-3 border outline-none border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      {/* Action buttons */}
      <div className="flex space-x-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSaveProfile}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
