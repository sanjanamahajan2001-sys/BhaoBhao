// src/features/auth/services/AuthService.ts
export interface AuthService {
  signIn(email: string): Promise<void>;
  signUp(
    email: string,
    profile?: {
      name: string;
      mobile: string;
      gender: string;
      dateOfBirth: string;
      profileImage?: string;
    }
  ): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<void>;
}

// export const authService: AuthService = {
//   signIn: async (email: string) => {
//     console.log('Sign in with email:', email);
//   },
//   signUp: async (email: string, profile?: any) => {
//     console.log('Sign up with email:', email);
//     console.log('Profile:', profile);
//   },
//   verifyOtp: async (email: string, otp: string) => {
//     console.log('Verify OTP for email:', email);
//     console.log('OTP:', otp);
//   },
// };
