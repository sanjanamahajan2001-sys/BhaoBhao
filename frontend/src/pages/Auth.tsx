import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpData } from '../types/auth.types';
import {
  setupDemoSession,
  parseRateLimitError,
  validateSignUpData,
} from '../utils/auth.utils';

// Components
import AuthBranding from '../components/auth/AuthBranding';
import SignUpForm from '../components/auth/SignUpForm';
import SignInForm from '../components/auth/SignInForm';
import OTPForm from '../components/auth/OTPForm';
import ErrorAlert from '../components/common/ErrorAlert';
import DemoLoginButton from '../components/auth/DemoLoginButton';
import { useCooldown } from '../hooks/auth/useCoolDownHook';
import { useAuthMutations } from '../hooks/auth/useAuthMutation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
// import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  // Navigation
  const navigate = useNavigate();

  // State
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');

  const [otp, setOtp] = useState('');
  // const [otpReceived, setOptReceived] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [signUpData, setSignUpData] = useState<SignUpData>({
    profileImage: '',
    name: '',
    email: '',
    mobile: '',
    gender: 'Male',
    dateOfBirth: '',
  });
  const { setUser } = useAuth();
  // Custom hooks
  const {
    cooldownTime,
    startCooldown,
    isActive: isCooldownActive,
  } = useCooldown();
  const { sendOTP, verifyOTP } = useAuthMutations();

  // Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCooldownActive) {
      setError(
        `Please wait ${cooldownTime} seconds before requesting another code.`
      );
      return;
    }

    setError('');

    try {
      const emailToUse = isSignUp ? signUpData.email : identifier;

      if (isSignUp) {
        const validationError = validateSignUpData(signUpData);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // const res =
      await sendOTP.mutateAsync({
        email: emailToUse,
        isSignUp,
        signUpData: isSignUp ? signUpData : undefined,
      });

      setIsOtpSent(true);
      // setOptReceived(res.otp);
      startCooldown(60);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      if (error.message?.includes('over_email_send_rate_limit')) {
        const waitTime = parseRateLimitError(error.message);
        startCooldown(waitTime);
        setError(
          `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`
        );
      }
      // else {
      // setError('Failed to send OTP. Please try again.');
      // }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const emailToUse = isSignUp ? signUpData.email : identifier;
      const res = await verifyOTP.mutateAsync({ email: emailToUse, otp });
      console.log('OTP verified:', res);

      // Check if user has no full_name (first time login)
      if (!res?.user_info?.full_name?.trim()) {
        navigate('/complete-profile');
        return; // stop here so it doesn't continue to '/booking'
      }

      // Otherwise, go to booking page
      navigate('/booking');
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setOtp('');
      // setError('Invalid OTP. Please try again. ');
      // toast.error('Unable to verify OTP.');
    }
  };

  const handleBackToEmail = () => {
    setIsOtpSent(false);
    setOtp('');
    setError('');
  };

  const handleRetryOtp = async () => {
    if (isCooldownActive) {
      setError(
        `Please wait ${cooldownTime} seconds before requesting another code.`
      );
      return;
    }

    setError('');

    try {
      const emailToUse = isSignUp ? signUpData.email : identifier;
      await sendOTP.mutateAsync({
        email: emailToUse,
        isSignUp,
        signUpData: isSignUp ? signUpData : undefined,
      });
      startCooldown(60);
      toast.success('OTP re-sent successfully.');
    } catch (error: any) {
      if (error.message?.includes('over_email_send_rate_limit')) {
        const waitTime = parseRateLimitError(error.message);
        startCooldown(waitTime);
        toast.error(
          `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`
        );
        setError(
          `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`
        );
      } else {
        setError('Failed to send OTP. Please try again.');
        toast.error('Unable to send OTP.');
      }
    } finally {
      setOtp('');
    }
  };

  const handleDemoLogin = () => {
    const demoUser = setupDemoSession();
    setUser(demoUser); // <- immediately update context
    navigate('/');
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const resetForm = () => {
    setIsOtpSent(false);
    setEmail('');
    setOtp('');
    setError('');
    setSignUpData({
      profileImage: '',
      name: '',
      email: '',
      mobile: '',
      gender: 'Male',
      dateOfBirth: '',
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[url('/bg-login.jpeg')] bg-cover bg-center"
        aria-hidden="true"
      />

      {/* White overlay */}
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />

      {/* Content (always in front) */}
      <div className="relative flex-1 flex flex-col lg:flex-row">
        <AuthBranding />

        {/* Right Side - Auth Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 animate-slideUp">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome'}
                </h2>
                <p className="text-gray-600">
                  {isOtpSent
                    ? 'Enter the code sent to your mobile'
                    : isSignUp
                    ? 'Create your account with complete details'
                    : 'Sign in to your account'}
                </p>
              </div>

              {/* Error Alert */}
              {error && <ErrorAlert message={error} />}

              {/* Forms */}
              {!isOtpSent ? (
                isSignUp ? (
                  <SignUpForm
                    signUpData={signUpData}
                    setSignUpData={setSignUpData}
                    onSubmit={handleSendOtp}
                    loading={sendOTP.isPending}
                    cooldownTime={cooldownTime}
                  />
                ) : (
                  <SignInForm
                    // email={email}
                    // setEmail={setEmail}
                    identifier={identifier}
                    setIdentifier={setIdentifier}
                    onSubmit={handleSendOtp}
                    loading={sendOTP.isPending}
                    cooldownTime={cooldownTime}
                  />
                )
              ) : (
                <OTPForm
                  otp={otp}
                  setOtp={setOtp}
                  // otpReceived={otpReceived}
                  onSubmit={handleVerifyOtp}
                  onBack={handleBackToEmail}
                  onRetry={handleRetryOtp}
                  loading={verifyOTP.isPending}
                  cooldownTime={cooldownTime}
                  isSignUp={isSignUp}
                />
              )}

              {/* Mode Switch */}
              {/* <div className="mt-8 text-center"> */}
              {/* <button
                onClick={handleModeSwitch}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : 'New to Bhao Bhao? Create Account'}
              </button> */}
              {/* </div> */}

              {/* Demo Login */}
              {/* <DemoLoginButton onDemoLogin={handleDemoLogin} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
