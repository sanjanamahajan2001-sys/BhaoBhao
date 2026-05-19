import { UserInfo } from '@/components/profile/ProfileForm';
import { DemoBooking, SignUpData, User } from '../types/auth.types';

export const createDemoBookings = (): DemoBooking[] => {
  return [
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
      address: { label: 'Home', address: '123 Main Street, Anytown, ST 12345' },
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
      address: { label: 'Home', address: '123 Main Street, Anytown, ST 12345' },
      pet: { name: 'Max' },
    },
  ];
};

export const createDemoUser = (): UserInfo => {
  return {
    dob: '2000-05-22T00:00:00.000Z',
    email: 'demo@bhaobhao.com',
    full_name: 'Demo User',
    gender: 'male',
    phone_number: '',
    profile_image:
      'http://45.79.126.9:5001/uploads/profilePics/ghibli-art_1757591612248.png',
    role: 'customer',
  };
};

export const setupDemoSession = (): UserInfo => {
  const demoUser = createDemoUser();
  // const demoBookings = createDemoBookings();

  // Store demo data
  // localStorage.setItem('bhaobhao_user', JSON.stringify(demoUser));
  // sessionStorage.setItem('bhaobhao_user', JSON.stringify(demoUser));
  // localStorage.setItem('demo_bookings', JSON.stringify(demoBookings));
  // localStorage.setItem(
  //   'token',
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImN1c3RvbWVySWQiOjUsImlhdCI6MTc1NzA1NTg0OSwiZXhwIjoxNzU5NjQ3ODQ5fQ.phPIMI4T0sNri79vRVi26neZ4NEG-pGZI2wPytUbJN4'
  // );
  // sessionStorage.setItem(
  //   'token',
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImN1c3RvbWVySWQiOjUsImlhdCI6MTc1NzA1NTg0OSwiZXhwIjoxNzU5NjQ3ODQ5fQ.phPIMI4T0sNri79vRVi26neZ4NEG-pGZI2wPytUbJN4'
  // );

  console.log('🚀 Demo session created:', demoUser);

  return demoUser;
};

export const parseRateLimitError = (errorMessage: string): number => {
  const match = errorMessage.match(/after (\d+) seconds/);
  return match ? parseInt(match[1]) : 60;
};

export const validateSignUpData = (
  data: Partial<SignUpData>
): string | null => {
  if (!data.name?.trim()) return 'Name is required';
  if (!data.email?.trim()) return 'Email is required';
  if (!data.mobile?.trim()) return 'Mobile number is required';
  if (!data.dateOfBirth) return 'Date of birth is required';

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) return 'Please enter a valid email address';

  // Mobile validation (basic)
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(data.mobile.replace(/\D/g, ''))) {
    return 'Please enter a valid 10-digit mobile number';
  }

  return null;
};
