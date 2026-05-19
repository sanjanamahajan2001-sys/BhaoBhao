export interface SignUpData {
  profileImage: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  mobile?: string;
  profile_image?: string;
  gender?: string;
  date_of_birth?: string;
  created_at: string;
  // ----------------
  role?: string;
  full_name?: string;
  phone_number?: string;
  dob?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface DemoBooking {
  id: string;
  user_id: string;
  service_id: string;
  sub_service_id: string;
  groomer_type_id: string;
  address_id: string;
  pet_id: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  status: string;
  created_at: string;
  service: { name: string };
  sub_service: { name: string };
  groomer_type: { name: string };
  address: { label: string; address: string };
  pet: { name: string };
}
