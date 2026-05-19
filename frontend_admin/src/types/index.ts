// Updated types.ts to match actual API responses

export interface Customer {
  id: number;
  customer_name: string;
  gender: string;
  mobile_number: string;
  dob: string;
  profile_photo: string[];
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface BookingData {
  id: number;
  order_id: string;
  customer_id: number;
  pet_id: number;
  service_id: number;
  service_pricing_id: number;
  groomer_id: number | null;
  address_id: number;
  pet_size: string | null;
  appointment_time_slot: string;
  start_otp: string | null;
  end_otp: string | null;
  start_time: string | null;
  end_time: string | null;
  amount: number;
  tax: number;
  total: number;
  status: BookingStatus;
  notes: string | null;
  payment_method: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface Pet {
  id: number;
  customer_id: number;
  pet_name: string;
  pet_gender: string;
  nature: string | null;
  health_conditions: string | null;
  skin_condition: string | null;
  comments: string | null;
  pet_type_id: number;
  breed_id: number;
  owner_name: string;
  pet_dob: string;
  photo_url: string[];
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface PetType {
  id: number;
  name: string;
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface PetBreed {
  id: number;
  breed_name: string;
}

export interface Service {
  id: number;
  service_name: string;
  category_id: number;
  sub_category_id: number;
  pet_type: string[];
  gender: string[];
  breed: string[];
  small_description: string;
  description: string;
  stats: any;
  validity_sessions: any;
  photos: string[];
  priority: string;
  rating: number;
  total_ratings: number;
  duration_minutes: number;
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface ServicePricing {
  id: number;
  service_id: number;
  pet_size: string;
  groomer_level: string;
  mrp: number;
  discounted_price: number;
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface Address {
  id: number;
  customer_id: number;
  user_type: string | null;
  user_name: string | null;
  flat_no: string;
  floor: string | null;
  apartment_name: string;
  full_address: string;
  pincode: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  label: string;
  status: string;
  isDefault: boolean;
  special_instructions: string | null;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}

export interface GroomerData {
  id: number;
  groomer_name: string;
  gender: string;
  email_id: string;
  mobile_number: string;
  profile_image: string;
  dob: string | null;
  level: string;
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}
// Define the status type
export type BookingStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';
export interface Transaction {
  id: number;
  booking_id: number;
  amount: number;
  tax: number;
  total: number;
  method: string;
  notes: string | null;
  status: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
  createdat: string;
  updatedat: string;
}
// Add-on service interface
export interface AddonService {
  pricing_id: number;
  service_id: number;
  service_name: string;
  price: number;
  pet_size: string | null;
}

// Main booking interface that matches the API response structure
export interface Booking {
  id?: number; // Make optional since it might not be present in all contexts
  customer: Customer;
  booking: BookingData;
  groomer: GroomerData | null;
  pet: Pet;
  pet_type?: PetType | null;
  pet_breed?: PetBreed | null;
  service: Service;
  service_pricing: ServicePricing;
  address: Address;
  transactions: Transaction[];
  addon_services?: AddonService[]; // Add-on services array
  // Legacy properties for backward compatibility
  customerName?: string;
  petName?: string;
  date?: string;
  status?: BookingStatus;
  groomerId?: string;
  start_otp?: string;
  end_otp?: string;
}

// Simplified groomer interface for dropdowns
export interface Groomer {
  id: number;
  groomer_name: string;
  // Keep legacy name property for backward compatibility
  name?: string;
}

export interface LoginData {
  adminId: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  start_otp?: string;
  end_otp?: string;
}

export interface GroomerFormData {
  groomer_name: string;
  gender: string;
  email_id: string;
  mobile_number: string;
  dob: string;
  level: 'Beginner' | 'Intermediate' | 'Experienced';
  profile_image?: string;
}

export interface AnalyticsCounters {
  // Monthly stats
  monthlyTotalBookings: number;
  monthlyRepeatCustomer: number;
  todayBookings: number;

  // Overall stats
  overallTotalBookings: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface AnalyticsResponse {
  success: boolean;
  counters: AnalyticsCounters;
  message?: string;
}
