import React, { useState } from 'react';
import { Scissors, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';

export const LoginForm: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check if input has alphabets → email
  const hasAlphabet = /[a-zA-Z]/.test(identifier);

  // Email validation
  const isValidEmail = /\S+@\S+\.\S+/.test(identifier);

  // Phone validation (10 digits, optional +)
  const isValidPhone = /^\+?[0-9]{10}$/.test(identifier);

  // Mode detection
  const isEmail = hasAlphabet || isValidEmail;

  // Overall validity
  const isValidIdentifier = isEmail ? isValidEmail : isValidPhone;

  const handleSendOtp = async () => {
    if (!identifier) {
      toast.error(`Please enter your ${isEmail ? 'email' : 'phone number'}`);
      return;
    }

    if (!isValidIdentifier) {
      toast.error(
        `Please enter a valid ${isEmail ? 'email address' : 'phone number'}`
      );
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isEmail) {
        response = await authService.sendOTP(identifier);
      } else {
        response = await authService.sendSMSOTP(identifier);
      }
      toast.success(`OTP sent to your ${isEmail ? 'email' : 'phone'}!`);
      setOtpSent(true);
      console.log(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to send OTP`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    if (/\s/.test(otp)) {
      toast.error('Spaces are not allowed in OTP');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isEmail) {
        response = await authService.verifyOTP(identifier, otp);
      } else {
        response = await authService.verifySMSOTP(identifier, otp);
      }
      login(response.user_info, response.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Groomer Login
          </h2>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-left text-xs text-blue-800 leading-relaxed">
            💡 <strong>Demo Mode Active:</strong> Enter any registered groomer email/phone (e.g. <strong>groomer1@bhaobhao.in</strong> or phone <strong>9663176108</strong>) and use OTP <strong>123456</strong> to log in.
          </div>
        </div>

        {!otpSent ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {isEmail ? 'Email' : 'Phone Number'}
              </label>
              <div className="relative">
                {isEmail ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
                <input
                  type={isEmail ? 'email' : 'tel'}
                  className="w-full pl-10 pr-4 py-3 outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    isEmail ? 'Enter your email' : 'Enter your phone number'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              {!isValidIdentifier && identifier.length > 0 && (
                <p className="mt-1 text-sm text-red-500">
                  {isEmail
                    ? 'Please enter a valid email address'
                    : 'Please enter a valid 10-digit phone number'}
                </p>
              )}
            </div>
            <button
              onClick={handleSendOtp}
              disabled={isLoading || !isValidIdentifier}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Sending...'
                : `Send OTP to ${isEmail ? 'Email' : 'Phone'}`}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                OTP sent to your {isEmail ? 'email' : 'phone'}
              </p>
              <p className="text-sm font-medium text-gray-900">{identifier}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 outline-none border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
              className="w-full py-2 px-4 text-blue-600 border border-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Use different {isEmail ? 'email' : 'phone number'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
