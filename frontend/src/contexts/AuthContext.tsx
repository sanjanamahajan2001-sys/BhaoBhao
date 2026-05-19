import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { SignUpData, User } from '../types/auth.types';
import axiosInstance from '@/utils/axiosInstance';
import { UserInfo } from '@/components/profile/ProfileForm';
import toast from 'react-hot-toast';
// const STORAGE_KEY = 'bhaobhao_user';
// const TOKEN_KEY =
// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImN1c3RvbWVySWQiOjUsImlhdCI6MTc1NzIxODA2OCwiZXhwIjoxNzU5ODEwMDY4fQ.uLw9s4Q8I41Rm4I66EKBGjKApruO9Pcpl2WNHqj6g_k';
// interface User {
//   id: string;
//   email: string;
//   created_at: string;
// }

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  signUp: (email: string, signUpData: SignUpData) => Promise<void>;
  signIn: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<VerifyOTPResponse>;
  signOut: () => Promise<void>;
  setUser: (user: UserInfo) => void;
}
interface VerifyOTPResponse {
  message: string;
  token: string;
  user_info: {
    email: string;
    role: string;
    profile_image: string | null;
    full_name: string;
    gender: string;
    dob: string;
    phone_number: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const authExpiryKey = 'auth_expires_at'; // NOTE: 15-min local session expiry.

  // useEffect(() => {
  //   // Check for existing user session
  //   try {
  //     const storedUser = localStorage.getItem('bhaobhao_user');
  //     console.log('🔍 Checking localStorage for user:', !!storedUser);

  //     if (storedUser) {
  //       const userData = JSON.parse(storedUser);
  //       console.log(
  //         '✅ Found stored user, setting in context:',
  //         userData.email
  //       );
  //       setUser(userData);
  //     } else {
  //       console.log('❌ No stored user found');
  //     }
  //   } catch (error) {
  //     console.error('❌ Error parsing user from localStorage:', error);
  //     localStorage.removeItem('bhaobhao_user');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);
  useEffect(() => {
    try {
      const expiresAt = localStorage.getItem(authExpiryKey);
      if (expiresAt && Date.now() > Number(expiresAt)) {
        // NOTE: Expired session - clear localStorage and user state.
        localStorage.removeItem('token');
        localStorage.removeItem('bhaobhao_user');
        localStorage.removeItem(authExpiryKey);
      }
      // const storedUser = sessionStorage.getItem('bhaobhao_user');
      const storedUser = localStorage.getItem('bhaobhao_user');
      console.log('🔍 Checking sessionStorage for user:', !!storedUser);

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log(
          '✅ Found stored user, setting in context:',
          userData.email
        );
        setUser(userData);
      } else {
        console.log('❌ No stored user found');
      }
    } catch (error) {
      console.error('❌ Error parsing user from sessionStorage:', error);
      // sessionStorage.removeItem('bhaobhao_user');
      localStorage.removeItem('bhaobhao_user');
      localStorage.removeItem(authExpiryKey);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string): Promise<void> => {
    // Dummy implementation - replace with your backend
    console.log('📧 Sending OTP for sign up to:', email);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const signIn = async (identifier: string): Promise<void> => {
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    try {
      if (isEmail) {
        // Email login
        const res = await axiosInstance.post('/auth/mailgun_sendOTP', {
          email: identifier,
        });
        console.log('📧 Sending OTP for sign in to:', identifier, res.data);
        return res.data;
      } else {
        // Phone login
        const res = await axiosInstance.post('/auth/sms_sendOTP', {
          phone: identifier,
        });
        console.log('📱 Sending OTP for sign in to:', identifier, res.data);
        return res.data;
      }
    } catch (error: any) {
      console.log('📧 Sending OTP for sign in to:', identifier, error);
      console.error(
        'Sign in OTP error:',
        error.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || error?.message);
      throw error; // rethrow so the caller can handle it
    }
  };

  // const verifyOTP = async (
  //   email: string,
  //   otp: string
  // ): Promise<VerifyOTPResponse> => {
  //   try {
  //     const res = await axiosInstance.post('/auth/mailgun_verifyOTP', {
  //       email,
  //       otp,
  //     });

  //     console.log('📧 OTP verify response:', res.data);

  //     const { token, user_info } = res.data;

  //     // Store token + user info
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('bhaobhao_user', JSON.stringify(user_info));

  //     // -----------------Store token + user info in sessionStorage (not localStorage)----------------
  //     // sessionStorage.setItem('token', token);
  //     // sessionStorage.setItem('bhaobhao_user', JSON.stringify(user_info));

  //     // If you’re using auth context:
  //     setUser(user_info);

  //     return res.data; // typed as VerifyOTPResponse
  //   } catch (error: any) {
  //     console.error(
  //       'Sign in OTP error:',
  //       error.response?.data || error.message
  //     );
  //     toast.error(error?.response?.data?.message || error?.message);
  //     throw error; // rethrow for caller
  //   }
  // };
  const verifyOTP = async (
    identifier: string,
    otp: string
  ): Promise<VerifyOTPResponse> => {
    try {
      const isEmail = /\S+@\S+\.\S+/.test(identifier);

      const payload = isEmail
        ? { email: identifier, otp }
        : { phone: identifier, otp };
      const endpoint = isEmail
        ? '/auth/mailgun_verifyOTP'
        : '/auth/sms_verifyOTP';

      const res = await axiosInstance.post(endpoint, payload);

      console.log('✅ OTP verify response:', res.data);

      const { token, user_info } = res.data;

      // Save session
      localStorage.setItem('token', token);
      localStorage.setItem('bhaobhao_user', JSON.stringify(user_info));
      localStorage.setItem(
        authExpiryKey,
        String(Date.now() + 15 * 60 * 1000) // NOTE: Auto-expire login after 15 minutes.
      );
      setUser(user_info);

      return res.data;
    } catch (error: any) {
      console.error('OTP verify error:', error.response?.data || error.message);
      toast.error(error?.response?.data?.message || error?.message);
      throw error;
    }
  };
  const signOut = async (): Promise<void> => {
    localStorage.removeItem('bhaobhao_user');
    localStorage.removeItem('demo_bookings');
    localStorage.removeItem('token');
    localStorage.removeItem(authExpiryKey); // NOTE: Clear local session expiry.
    // setUser(null);
    // -------CHANGING TO SESSION STORAGE-------
    // sessionStorage.removeItem('bhaobhao_user');
    // sessionStorage.removeItem('demo_bookings');
    // sessionStorage.removeItem('token');
    setUser(null);
    // Redirect to landing page
    window.location.href = '/';
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    verifyOTP,
    signOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
