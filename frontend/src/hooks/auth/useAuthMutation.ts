import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { AuthError, SignUpData } from '@/types/auth.types';

export const useAuthMutations = () => {
  const { signUp, signIn, verifyOTP } = useAuth();

  const sendOTPMutation = useMutation({
    mutationFn: async ({
      email,
      isSignUp,
      signUpData,
    }: {
      email: string;
      isSignUp: boolean;
      signUpData?: SignUpData;
    }) => {
      if (isSignUp && signUpData) {
        return await signUp(email, signUpData);
      } else {
        return await signIn(email);
      }
    },
    onError: (error: AuthError) => {
      console.error('Send OTP failed:', error);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return await verifyOTP(email, otp);
    },
    onError: (error: AuthError) => {
      console.error('OTP verification failed:', error);
    },
  });

  return {
    sendOTP: sendOTPMutation,
    verifyOTP: verifyOTPMutation,
  };
};
