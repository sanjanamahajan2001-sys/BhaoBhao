// Updated api.ts with correct types and error handling

import axios from 'axios';
import {
  Booking,
  Groomer,
  LoginData,
  ApiResponse,
  GroomerData,
  GroomerFormData,
  AnalyticsResponse,
} from '../types';

// Actual API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://45.79.126.9:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ✅ Ideally store your key in an env var
const apiKey =
  import.meta.env.VITE_API_KEY ||
  '89dfa480a72e611280022f968e162155_57cf7b8248fffe96';

// Add auth token + apiKey to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

// ✅ Response interceptor → handles 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('tokenExpiry');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------------------- APIs ----------------------

// Auth API
export const authAPI = {
  login: async (
    loginData: LoginData
  ): Promise<ApiResponse<{ token: string }>> => {
    try {
      const res = await api.post('/auth/login_admin', {
        user_id: loginData.adminId,
        password: loginData.password,
      });

      return {
        success: true,
        data: res.data, // should contain { token }
        message: 'Login successful',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  },
};

// Interface for the actual API response structure
interface BookingAPIResponse {
  message: string;
  data: Booking[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
  };
}

interface GroomerAPIResponse {
  message: string;
  data: GroomerData[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
  };
}

// Booking API
export const bookingAPI = {
  getBookings: async (
    page: number = 1,
    limit: number = 10,
    status: string = '',
    search: string = ''
  ): Promise<ApiResponse<BookingAPIResponse>> => {
    try {
      const res = await api.get(
        `/bookings/allBookings?page=${page}&limit=${limit}&status=${status}&search=${search}`
      );
      return {
        success: true,
        data: res.data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch bookings',
      };
    }
  },

  updateBookingStatus: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const res = await api.put(`/bookings/assignGroomer/${id}`);
      return {
        success: true,
        message: res.data?.message || `Booking status updated`,
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message || 'Failed to update booking status',
      };
    }
  },

  assignGroomer: async (
    bookingId: string,
    groomerId: string
  ): Promise<ApiResponse<{ start_otp?: string; end_otp?: string }>> => {
    try {
      const res = await api.put(`/bookings/assignGroomer/${bookingId}`, {
        groomer_id: groomerId,
      });
      return {
        success: true,
        message: res.data?.message || 'Groomer assigned successfully',
        start_otp: res.data?.start_otp,
        end_otp: res.data?.end_otp,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to assign groomer',
      };
    }
  },
};

// Groomer API
export const groomerAPI = {
  getGroomers: async (
    page: number = 1,
    limit: number = 10,
    level: string = '',
    search: string = ''
  ): Promise<ApiResponse<GroomerAPIResponse>> => {
    try {
      const res = await api.get(
        `/groomers/all?page=${page}&limit=${limit}&level=${level}&search=${search}`
      );
      return {
        success: true,
        data: res.data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch groomers',
      };
    }
  },

  createGroomer: async (
    groomerData: FormData
  ): Promise<ApiResponse<{ message: string; profile_image?: string }>> => {
    try {
      const res = await api.post('/groomers/save', groomerData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        success: true,
        data: res.data,
        message: res.data?.message || 'Groomer created successfully',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create groomer',
      };
    }
  },

  deleteGroomer: async (
    groomerId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const res = await api.delete(`/groomers/delete/${groomerId}`);
      return {
        success: true,
        data: res.data,
        message: res.data?.message || 'Groomer deleted successfully',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to delete groomer',
      };
    }
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardCounters: async (): Promise<AnalyticsResponse> => {
    try {
      const response = await api.get('/analytics/dashboardCounters');

      if (!response.status || response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        counters: response.data.counters,
      };
    } catch (error) {
      console.error('Error fetching dashboard counters:', error);
      return {
        success: false,
        counters: {
          monthlyTotalBookings: 0,
          monthlyRepeatCustomer: 0,
          todayBookings: 0,
          overallTotalBookings: 0,
          scheduled: 0,
          inProgress: 0,
          completed: 0,
        },
        message:
          error instanceof Error ? error.message : 'Failed to fetch analytics',
      };
    }
  },
};
