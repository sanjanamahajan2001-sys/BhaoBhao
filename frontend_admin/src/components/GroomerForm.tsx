import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from './Header';
import { Trash2 } from 'lucide-react';
import Footer from './common/Footer';
import { groomerAPI } from '../services/api';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GroomerFormData, GroomerData } from '../types';

const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://45.79.126.9:5001';
interface HomePageProps {
  onLogout: () => void;
}

interface FormErrors {
  groomer_name?: string;
  email_id?: string;
  mobile_number?: string;
  dob?: string;
  gender?: string;
}

interface LocationState {
  groomerData?: GroomerData;
}

// Helper function to convert ISO date string to YYYY-MM-DD format for date input
const formatDateForInput = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper function to construct full image URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Otherwise, construct full URL with API base
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

const GroomerForm: React.FC<HomePageProps> = ({ onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  // Get groomer data from navigation state
  const groomerData = (location.state as LocationState)?.groomerData;
  console.log('Groomer Data:', groomerData);

  const handleLogout = () => {
    // localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    onLogout();
  };

  const [formData, setFormData] = useState<GroomerFormData>({
    groomer_name: '',
    gender: '',
    email_id: '',
    mobile_number: '',
    profile_image: undefined,
    dob: '',
    level: 'Intermediate',
  });

  const [profileImage, setProfileImage] = useState<string | undefined>('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [dob, setDob] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load groomer data for edit mode
  useEffect(() => {
    if (isEditMode && groomerData) {
      // Format the DOB for date input (YYYY-MM-DD)
      const formattedDob = groomerData.dob
        ? formatDateForInput(groomerData.dob)
        : '';

      // Pre-populate form with existing data from navigation state
      setFormData({
        groomer_name: groomerData.groomer_name || '',
        gender: groomerData.gender || '',
        email_id: groomerData.email_id || '',
        mobile_number: groomerData.mobile_number || '',
        profile_image: undefined,
        dob: formattedDob,
        level:
          (groomerData.level as 'Beginner' | 'Intermediate' | 'Experienced') ||
          'Intermediate',
      });

      // Set profile image if exists - construct full URL
      if (groomerData.profile_image && groomerData.profile_image.length > 0) {
        const imageUrl = getImageUrl(groomerData.profile_image);
        setProfileImage(imageUrl);
        console.log('Profile image URL:', imageUrl);
      }

      // Set the date object for additional date handling if needed
      if (groomerData.dob) {
        setDob(new Date(groomerData.dob));
      }
    } else if (isEditMode && !groomerData) {
      // If in edit mode but no data passed, redirect back to groomers list
      toast.error(
        'Groomer data not found. Please try again from the groomers list.'
      );
      navigate('/groomers');
    }
  }, [isEditMode, groomerData, navigate]);

  // Validation function
  const validateField = (
    field: keyof GroomerFormData,
    value: string
  ): string => {
    switch (field) {
      case 'groomer_name':
        if (!value.trim()) return 'Groomer name is required';
        if (!NAME_REGEX.test(value)) return 'Only letters and spaces allowed';
        if (value.length > 50) return 'Name cannot exceed 50 characters';
        return '';

      case 'email_id':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value))
          return 'Please enter a valid email address';
        return '';

      case 'mobile_number':
        if (!value.trim()) return 'Mobile number is required';
        if (!MOBILE_REGEX.test(value))
          return 'Please enter a valid 10-digit mobile number';
        return '';

      case 'dob':
        if (!value) return 'Date of birth is required';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthday =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());
        const actualAge = hasHadBirthday ? age : age - 1;

        if (birthDate < new Date('1900-01-01'))
          return 'Please enter a valid date';
        if (actualAge < 18) return 'Must be at least 18 years old';
        return '';

      case 'gender':
        if (!value) return 'Gender is required';
        return '';

      default:
        return '';
    }
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    const requiredFields: (keyof GroomerFormData)[] = [
      'groomer_name',
      'email_id',
      'mobile_number',
      'dob',
      'gender',
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field] as string);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof GroomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Real-time validation for touched fields
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleFieldBlur = (field: keyof GroomerFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files?.[0];

    // ✅ Ensure only images are allowed
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (jpg, png, etc.)');
      e.target.value = '';
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
      setProfileImage(URL.createObjectURL(file)); // Create blob URL for new file
      e.target.value = '';
    }
  };

  // Remove uploaded photo
  const handleRemovePhoto = () => {
    setProfileImage(undefined);
    setProfileFile(null);
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    // Validate all fields
    if (!validateAllFields()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const form = new FormData();

      if (isEditMode) {
        form.append('IsNew', 'false');
        form.append('GroomerID', id!);
      } else {
        form.append('IsNew', 'true');
      }

      form.append('groomer_name', formData.groomer_name);
      form.append('gender', formData.gender);
      form.append('email_id', formData.email_id);
      form.append('mobile_number', formData.mobile_number);
      form.append('level', formData.level);
      form.append('dob', formData.dob);

      if (profileFile) {
        form.append('groomer_pic', profileFile);
      }

      const response = await groomerAPI.createGroomer(form);

      if (response.success) {
        toast.success(
          response.message ||
          (isEditMode
            ? 'Groomer updated successfully'
            : 'Groomer created successfully')
        );
        // Navigate back to groomers list
        navigate('/groomers');
      } else {
        toast.error(
          response.message ||
          (isEditMode
            ? 'Failed to update groomer'
            : 'Failed to create groomer')
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        isEditMode ? 'Failed to update groomer' : 'Failed to save profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Groomer' : 'Add New Groomer'}
            </h1>
            <p className="text-gray-600">
              {isEditMode
                ? 'Update the groomer profile details'
                : 'Fill in the details to create a new groomer profile'}
            </p>
          </div>

          {/* Profile photo */}
          <div className="flex flex-col items-center">
            <div className="relative inline-block">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-36 w-36 rounded-xl object-cover border-2 border-gray-200"
                    onError={(e) => {
                      console.error('Image failed to load:', profileImage);
                      // Optionally set a fallback image
                      // e.currentTarget.src = '/path/to/fallback-image.jpg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full shadow p-1 hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 w-36 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-500 transition">
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-gray-500 text-sm">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            {isEditMode && !profileFile && (
              <p className="text-xs text-gray-500 mt-2">
                Upload a new image to replace the current one
              </p>
            )}
          </div>

          <div className="w-full gap-4 grid sm:grid-cols-2">
            {/* Groomer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Groomer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.groomer_name}
                onChange={(e) =>
                  handleInputChange('groomer_name', e.target.value)
                }
                onBlur={() => handleFieldBlur('groomer_name')}
                className={`w-full outline-none p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.groomer_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter groomer name"
                maxLength={50}
              />
              {errors.groomer_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.groomer_name}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile_number}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    handleInputChange('mobile_number', value);
                  }
                }}
                onBlur={() => handleFieldBlur('mobile_number')}
                className={`w-full p-3 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.mobile_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              {errors.mobile_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mobile_number}
                </p>
              )}
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email_id}
                onChange={(e) => handleInputChange('email_id', e.target.value)}
                onBlur={() => handleFieldBlur('email_id')}
                className={`w-full p-3 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.email_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter email address"
              />
              {errors.email_id && (
                <p className="mt-1 text-sm text-red-600">{errors.email_id}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  setDob(d);
                  handleInputChange('dob', e.target.value);
                }}
                onBlur={() => handleFieldBlur('dob')}
                className={`w-full p-3 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.dob ? 'border-red-500' : 'border-gray-300'
                  }`}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                onBlur={() => handleFieldBlur('gender')}
                className={`w-full p-3 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full p-3 outline-none border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/groomers')}
              className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {isLoading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Groomer'
                  : 'Create Groomer'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GroomerForm;
