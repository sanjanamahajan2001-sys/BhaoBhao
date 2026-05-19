import React from 'react';
import { Mail, User, Phone, Calendar, Camera } from 'lucide-react';
import { SignUpData } from '@/types/auth.types';

interface SignUpFormProps {
  signUpData: SignUpData;
  setSignUpData: React.Dispatch<React.SetStateAction<SignUpData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  cooldownTime: number;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  signUpData,
  setSignUpData,
  onSubmit,
  loading,
  cooldownTime,
}) => {
  const isFormValid =
    signUpData.name &&
    signUpData.email &&
    signUpData.mobile &&
    signUpData.dateOfBirth;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Profile Image */}
      <div>
        <label
          htmlFor="profileImage"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Profile Image (Optional)
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            {signUpData.profileImage ? (
              <img
                src={signUpData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <input
              id="profileImage"
              type="url"
              value={signUpData.profileImage}
              onChange={(e) =>
                setSignUpData((prev) => ({
                  ...prev,
                  profileImage: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter image URL"
            />
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="name"
            type="text"
            value={signUpData.name}
            onChange={(e) =>
              setSignUpData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="signupEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="signupEmail"
            type="email"
            value={signUpData.email}
            onChange={(e) =>
              setSignUpData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {/* Mobile */}
      <div>
        <label
          htmlFor="mobile"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="mobile"
            type="tel"
            value={signUpData.mobile}
            onChange={(e) =>
              setSignUpData((prev) => ({ ...prev, mobile: e.target.value }))
            }
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your mobile number"
          />
        </div>
      </div>

      {/* Gender and Date of Birth */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            value={signUpData.gender}
            onChange={(e) =>
              setSignUpData((prev) => ({ ...prev, gender: e.target.value }))
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="dateOfBirth"
              type="date"
              value={signUpData.dateOfBirth}
              onChange={(e) =>
                setSignUpData((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || cooldownTime > 0 || !isFormValid}
        className="w-full bg-teal-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-teal-500 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : cooldownTime > 0 ? (
          <span>Wait {cooldownTime}s</span>
        ) : (
          <span>Send Verification Code</span>
        )}
      </button>

      {cooldownTime > 0 && (
        <div className="text-center text-sm text-gray-600">
          You can request a new code in {cooldownTime} seconds
        </div>
      )}
    </form>
  );
};

export default SignUpForm;

