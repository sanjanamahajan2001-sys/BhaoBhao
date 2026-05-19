// utils/axiosInstance.ts
import axios from 'axios';

const apiKey =
  import.meta.env.VITE_API_KEY ||
  '89dfa480a72e611280022f968e162155_57cf7b8248fffe96';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://45.79.126.9:5001';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey ?? '',
  },
});

// 🔹 Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('groomer_token')
      : null;

  const skipAuthPaths = ['/auth/sendOTP', '/auth/verifyOTP'];
  const url = config.url || '';
  const shouldSkipAuth = skipAuthPaths.some((path) => url.includes(path));

  config.headers = config.headers ?? {};

  if (!shouldSkipAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Response interceptor (handles 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      typeof window !== 'undefined'
    ) {
      // ✅ Clear session on unauthorized
      sessionStorage.removeItem('groomer_token');
      sessionStorage.removeItem('groomer_info');

      // Optional: redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
