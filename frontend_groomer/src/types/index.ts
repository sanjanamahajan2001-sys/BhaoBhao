export interface Groomer {
  email: string;
  role: string;
  groomer_name: string;
  gender: string;
  mobile_number: string;
  profile_image: string[];
  dob: string | null;
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
  createdat: string;
  updatedat: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  pet: Pet;
  customer: Customer;
  services: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  notes?: string;
  estimatedDuration: number; // in minutes
}

export interface LoginCredentials {
  groomerId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  groomer: Groomer;
}

// Add to your existing types
export interface PaymentTransaction {
  id?: number;
  transaction_id?: string;
  booking_id: number;
  amount: number;
  method: 'UPI' | 'Cash';
  notes: string;
  status?: 'Completed' | 'Pending';
  createdat?: string;
  updatedat?: string;
}
// Add-on service interface
export interface AddonService {
  pricing_id: number;
  service_id: number;
  service_name: string;
  price: number;
  pet_size: string | null;
}

export interface BookingData {
  customer: any;
  booking: {
    id: number;
    status: string;
    appointment_time_slot: string;
    total: number;
    notes?: string;
    [key: string]: any;
  };
  pet: Pet;
  pet_type?: { id: number; name: string };
  pet_breed?: { id: number; breed_name: string };
  service: any;
  service_pricing: any;
  address: any;
  transactions: PaymentTransaction[];
  addon_services?: AddonService[]; // Add-on services array
}

