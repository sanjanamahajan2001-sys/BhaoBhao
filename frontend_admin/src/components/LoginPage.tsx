import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { LogIn, User, Lock } from 'lucide-react';
import { authAPI } from '../services/api';
import Footer from './common/Footer';

interface LoginPageProps {
  onLoginSuccess: () => void;
}
const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in ms
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adminId || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.success && response.data) {
        // localStorage.setItem('adminToken', response.data.token);
        sessionStorage.setItem('adminToken', response.data.token);
        // localStorage.setItem('tokenExpiry', expiryTime.toString());
        sessionStorage.setItem('tokenExpiry', expiryTime.toString());
        toast.success('Login successful!');
        onLoginSuccess();
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 flex-grow flex flex-col justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        {/* Recruiter / Portfolio Demo Mode Instructions Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left text-sm text-emerald-800 flex items-start gap-2.5">
          <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
            <span className="block w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
          </div>
          <div>
            <p className="font-semibold text-emerald-950">💡 Portfolio Demo Mode Active</p>
            <p className="mt-1 text-emerald-800">
              For portfolio evaluation, you can bypass real production credential checks. Please sign in using:
            </p>
            <p className="mt-1.5 font-mono text-emerald-950 font-semibold bg-white px-2 py-1 rounded border border-emerald-100 inline-block">
              Admin ID: <span className="underline">admin</span> <span className="mx-2">|</span> Password: <span className="underline">admin</span>
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="adminId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="adminId"
                  name="adminId"
                  type="text"
                  required
                  value={formData.adminId}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your admin ID"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
