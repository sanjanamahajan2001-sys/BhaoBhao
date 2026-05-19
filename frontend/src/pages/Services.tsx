import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  ArrowRight,
  Shield,
  Scissors,
  Heart,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const { signUp, signIn, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Create a demo user session
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@bhaobhao.com',
      created_at: new Date().toISOString(),
    };

    console.log('🚀 Setting demo user:', demoUser);

    createDemoBookings();

    // Set user in localStorage to simulate login
    localStorage.setItem('bhaobhao_user', JSON.stringify(demoUser));
    // sessionStorage.setItem('bhaobhao_user', JSON.stringify(demoUser));

    // Force page reload to trigger auth context update
    window.location.reload();
  };

  // Add some demo bookings when demo user logs in
  const createDemoBookings = () => {
    const demoBookings = [
      {
        id: 'booking-demo-1',
        user_id: 'demo-user-id',
        service_id: '550e8400-e29b-41d4-a716-446655440001',
        sub_service_id: '550e8400-e29b-41d4-a716-446655440011',
        groomer_type_id: '550e8400-e29b-41d4-a716-446655440042',
        address_id: 'addr-1',
        pet_id: 'pet-1',
        booking_date: '2025-01-15',
        booking_time: '10:00',
        total_price: 45,
        status: 'confirmed',
        created_at: '2025-01-10T10:00:00Z',
        service: { name: 'Basic Bath' },
        sub_service: { name: 'Wash & Dry' },
        groomer_type: { name: 'Senior Groomer' },
        address: {
          label: 'Home',
          address: '123 Main Street, Anytown, ST 12345',
        },
        pet: { name: 'Buddy' },
      },
      {
        id: 'booking-demo-2',
        user_id: 'demo-user-id',
        service_id: '550e8400-e29b-41d4-a716-446655440002',
        sub_service_id: '550e8400-e29b-41d4-a716-446655440021',
        groomer_type_id: '550e8400-e29b-41d4-a716-446655440043',
        address_id: 'addr-2',
        pet_id: 'pet-2',
        booking_date: '2025-01-20',
        booking_time: '14:30',
        total_price: 96,
        status: 'confirmed',
        created_at: '2025-01-12T14:30:00Z',
        service: { name: 'Professional Grooming' },
        sub_service: { name: 'Full Groom' },
        groomer_type: { name: 'Master Groomer' },
        address: {
          label: 'Office',
          address: '456 Business Ave, Corporate City, ST 67890',
        },
        pet: { name: 'Whiskers' },
      },
      {
        id: 'booking-demo-3',
        user_id: 'demo-user-id',
        service_id: '550e8400-e29b-41d4-a716-446655440003',
        sub_service_id: '550e8400-e29b-41d4-a716-446655440031',
        groomer_type_id: '550e8400-e29b-41d4-a716-446655440041',
        address_id: 'addr-1',
        pet_id: 'pet-3',
        booking_date: '2025-01-08',
        booking_time: '11:00',
        total_price: 100,
        status: 'completed',
        created_at: '2025-01-05T11:00:00Z',
        service: { name: 'Premium Spa' },
        sub_service: { name: 'Spa Package' },
        groomer_type: { name: 'Junior Groomer' },
        address: {
          label: 'Home',
          address: '123 Main Street, Anytown, ST 12345',
        },
        pet: { name: 'Max' },
      },
      {
        id: 'booking-demo-4',
        user_id: 'demo-user-id',
        service_id: '550e8400-e29b-41d4-a716-446655440001',
        sub_service_id: '550e8400-e29b-41d4-a716-446655440013',
        groomer_type_id: '550e8400-e29b-41d4-a716-446655440042',
        address_id: 'addr-3',
        pet_id: 'pet-1',
        booking_date: '2025-01-25',
        booking_time: '16:00',
        total_price: 59,
        status: 'pending',
        created_at: '2025-01-13T16:00:00Z',
        service: { name: 'Basic Bath' },
        sub_service: { name: 'Wash, Dry & Brush' },
        groomer_type: { name: 'Senior Groomer' },
        address: {
          label: 'Pet Center',
          address: '789 Pet Plaza, Animal Town, ST 54321',
        },
        pet: { name: 'Buddy' },
      },
      {
        id: 'booking-demo-5',
        user_id: 'demo-user-id',
        service_id: '550e8400-e29b-41d4-a716-446655440002',
        sub_service_id: '550e8400-e29b-41d4-a716-446655440022',
        groomer_type_id: '550e8400-e29b-41d4-a716-446655440041',
        address_id: 'addr-2',
        pet_id: 'pet-2',
        booking_date: '2025-01-30',
        booking_time: '09:30',
        total_price: 75,
        status: 'pending',
        created_at: '2025-01-14T09:30:00Z',
        service: { name: 'Professional Grooming' },
        sub_service: { name: 'Nail Trim & Ear Clean' },
        groomer_type: { name: 'Junior Groomer' },
        address: {
          label: 'Office',
          address: '456 Business Ave, Corporate City, ST 67890',
        },
        pet: { name: 'Whiskers' },
      },
    ];

    localStorage.setItem('bhaobhao_bookings', JSON.stringify(demoBookings));
    // sessionStorage.setItem('bhaobhao_bookings', JSON.stringify(demoBookings));
  };

  // Cooldown timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldownTime > 0) {
      setError(
        `Please wait ${cooldownTime} seconds before requesting another code.`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // await signUp(email);
      } else {
        await signIn(email);
      }
      setIsOtpSent(true);
      setCooldownTime(60); // Set 60 second cooldown
    } catch (error: any) {
      console.error(
        'Error sending OTP:',
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;
      setError(backendMessage || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOTP(email, otp);
      navigate('/');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setIsOtpSent(false);
    setOtp('');
    setError('');
    // Don't reset cooldown when going back
  };

  const features = [
    { icon: Scissors, text: 'Professional Grooming' },
    { icon: Heart, text: 'Caring Service' },
    { icon: Sparkles, text: 'Premium Experience' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-md w-full text-center lg:text-left animate-fadeIn">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-teal-600 to-purple-600 p-4 rounded-2xl w-16 h-16 mx-auto lg:mx-0 mb-4">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pet<span className="text-teal-600">Groomer</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Premium grooming services for your beloved pets
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 lg:justify-start justify-center"
              >
                <feature.icon className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideUp">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isOtpSent
                  ? 'Enter the code sent to your mobile'
                  : isSignUp
                  ? 'Sign up with your email address'
                  : 'Sign in to your account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || cooldownTime > 0}
                  className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : cooldownTime > 0 ? (
                    <span>Wait {cooldownTime}s</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {cooldownTime > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    You can request a new code in {cooldownTime} seconds
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent tracking-wider text-center text-lg"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
                >
                  Back to Email
                </button>

                {cooldownTime > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    New code available in {cooldownTime} seconds
                  </div>
                )}
              </form>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsOtpSent(false);
                  setEmail('');
                  setOtp('');
                  setError('');
                  // Don't reset cooldown when switching between sign up/in
                }}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : 'New to BHAO BHAO? Create Account'}
              </button>
            </div>

            {/* Demo Login Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button
                onClick={handleDemoLogin}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>🚀 Demo Login</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Skip authentication for testing purposes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
