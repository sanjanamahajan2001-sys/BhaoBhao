// utils/axiosInstance.ts
import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;
// API Base URL configuration:
// - In production: Use relative path '/api' (nginx proxies /api/ to backend)
// - In development: Use VITE_API_BASE_URL if set, otherwise default to localhost:5000
// To override: Set VITE_API_BASE_URL in .env.local for dev or build-time for production
const baseURL = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.DEV ? 'http://localhost:5000' : '/api');

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey ?? '',
  },
});

// Request interceptor (you already had this)
axiosInstance.interceptors.request.use((config) => {
  const token =
    // typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const skipAuthPaths = ['/auth/sendOTP', '/auth/verifyOTP'];
  const url = config.url || '';
  const shouldSkipAuth = skipAuthPaths.some((path) => url.includes(path));

  config.headers = config.headers ?? {};

  if (!shouldSkipAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Response interceptor for handling 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error:', error);
    // Handle 401 error
    if (error.response?.status === 401) {
      // Clear session
      // sessionStorage.removeItem('token');
      // sessionStorage.removeItem('bhaobhao_user');
      // sessionStorage.removeItem('demo_bookings');
      localStorage.removeItem('token');
      localStorage.removeItem('bhaobhao_user');
      localStorage.removeItem('demo_bookings');

      // Optionally redirect to login
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
