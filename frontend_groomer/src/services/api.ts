import { BookingData, PaymentTransaction } from '../types';
import axiosInstance from '../utils/axiosIntance';

interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
}
interface VerifyOTPResponse {
  message: string;
  token: string;
  user_info: {
    email: string;
    role: string;
    groomer_name: string;
    gender: string;
    mobile_number: string;
    profile_image: string[];
    dob: string | null;
  };
}

const getMyBookings = async (params: GetBookingsParams) => {
  try {
    const res = await axiosInstance.get<{
      data: BookingData[];
      pagination: {
        totalRecords: number;
        currentPage: number;
        perPage: number;
        totalPages: number;
      };
    }>('/bookings/myBookings', { params });
    return res;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

const sendOTP = async (email: string) => {
  const res = await axiosInstance.post('/auth/mailgun_sendOTP', {
    email,
    user_type: 'groomer',
  });
  return res.data;
};

const verifyOTP = async (
  email: string,
  otp: string
): Promise<VerifyOTPResponse> => {
  const res = await axiosInstance.post('/auth/mailgun_verifyOTP', {
    email,
    otp,
    user_type: 'groomer',
  });
  return res.data;
};
// SMS OTP functions
const sendSMSOTP = async (phone: string) => {
  try {
    const res = await axiosInstance.post('/auth/sms_sendOTP', {
      phone,
      user_type: 'groomer',
    });
    return res.data;
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    throw error;
  }
};

const verifySMSOTP = async (
  phone: string,
  otp: string
): Promise<VerifyOTPResponse> => {
  try {
    const res = await axiosInstance.post('/auth/sms_verifyOTP', {
      phone,
      otp,
      user_type: 'groomer',
    });
    return res.data;
  } catch (error) {
    console.error('Error verifying SMS OTP:', error);
    throw error;
  }
};
const startBooking = (id: number, payload: { start_otp: string }) =>
  axiosInstance.put(`/bookings/startBooking/${id}`, payload);

const completeBooking = (id: number, payload: { end_otp: string }) =>
  axiosInstance.put(`/bookings/completeBooking/${id}`, payload);

const createPaymentTransaction = async (transaction: PaymentTransaction) => {
  const res = await axiosInstance.post('/transactions/new', transaction);
  return res.data;
};
const getGroomerDashboardCounters = async (): Promise<{
  success: boolean;
  counters: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
  message?: string;
}> => {
  try {
    const res = await axiosInstance.get('/analytics/dashboardCountersGroomer');
    return {
      success: true,
      counters: res.data.counters,
    };
  } catch (err: any) {
    return {
      success: false,
      counters: { total: 0, scheduled: 0, inProgress: 0, completed: 0 },
      message: err.response?.data?.message || 'Failed to fetch groomer stats',
    };
  }
};
// ----------------GROOMER ANALYTICS---------------
export const analyticsAPI = {
  getGroomerDashboardCounters,
};
export const paymentService = {
  createTransaction: createPaymentTransaction,
};

export const authService = {
  sendOTP,
  verifyOTP,
  sendSMSOTP,
  verifySMSOTP,
};

export const bookingService = {
  getMyBookings,
  startBooking,
  completeBooking,
};
