// export interface Category {
//   id: number;
//   name: string;
//   description: string;
//   photos: string[];
//   priority: string;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
//   lastSync: string | null;
//   sync: boolean;
//   delete: boolean;
// }

// export interface Service {
//   id: string;
//   name: string;
//   smallDescription: string;
//   description: string;
//   originalPrice: number;
//   discountPrice: number;
//   discount: number;
//   pricing: PricingOption[];
//   durationMinutes: number;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
//   lastSync: string | null;
//   sync: boolean;
//   delete: boolean;
// }

// export type Pets = {
//   id: number;
//   pet_name: string;
//   pet_dob: string;
//   breed_name: string | null;
//   photo_url: string[];
//   nature: string;
//   health_conditions: string;
//   status: string;
//   selected?: boolean;
//   pet_details: any;
//   pet_breed_obj: any;
//   pet_type_obj: any;
//   pet_gender?: string;
//   pet_type_id?: string;
//   breed_id?: string;
//   owner_name?: string;
//   pet_pic_url?: string;
// };

// export interface Address {
//   id: number;
//   flat_no: string;
//   floor: string | null;
//   apartment_name: string;
//   full_address: string;
//   city: string;
//   state: string;
//   pincode: string;
//   location: string;
//   latitude: number;
//   longitude: number;
//   label: string;
//   status: string;
//   isDefault: boolean;
//   special_instructions: string | null;
// }

// export interface PricingOption {
//   id: number;
//   pet_size: string;
//   groomer_level: string;
//   mrp: number;
//   discounted_price: number;
// }
// export interface GroomerType {
//   id: string;
//   name: string;
//   description: string;
//   price_multiplier: number;
// }

// export interface BookingDetails {
//   category?: Category;
//   service?: Service;
//   groomerType?: GroomerType;
//   selectedPricing?: PricingOption; // 👈 add this
//   address?: Address;
//   pets?: Pets[];
//   slots?: { date: string; time: string }[];
//   notes?: string;
//   nature?: string;
//   health_conditions?: string;
// }
export interface Category {
  id: number;
  name: string;
  description: string;
  photos: string[];
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastSync: string | null;
  sync: boolean;
  delete: boolean;
}

export interface Service {
  id: string;
  name: string;
  smallDescription: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  pricing: PricingOption[];
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastSync: string | null;
  sync: boolean;
  delete: boolean;
  is_addon?: boolean;

}

export type Pets = {
  id: number;
  pet_name: string;
  pet_dob: string;
  breed_name: string | null;
  photo_url: string[];
  nature: string;
  health_conditions: string;
  skin_condition: string;
  comments: string;
  status: string;
  selected?: boolean;
  pet_details: any;
  pet_breed_obj: any;
  pet_type_obj: any;
  pet_gender?: string;
  pet_type_id?: string;
  breed_id?: string;
  owner_name?: string;
  pet_pic_url?: string;
};

export interface Address {
  id: number;
  flat_no: string;
  floor: string | null;
  apartment_name: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  location: string;
  latitude: number;
  longitude: number;
  label: string;
  status: string;
  isDefault: boolean;
  special_instructions: string | null;
}

export interface PricingOption {
  id: number;
  pet_size: string;
  groomer_level: string;
  mrp: number;
  discounted_price: number;
}

export interface GroomerType {
  id: string;
  name: string;
  description: string;
  price_multiplier: number;
}

export interface ServicePetConnection {
  id: string; // unique identifier for each connection
  service: ServiceWithPricing;
  pet: Pets;
  selectedPricing: PricingOption; // automatically selected max price
  notes?: string;
}

export interface ServiceWithPricing {
  id: number;
  name: string;
  photos: string[];
  smallDescription: string;
  description: string;
  rating: number;
  totalRatings: number;
  durationMinutes: number;
  petType: string[];
  petBreed: string[];
  gender: string[];
  pricing: PricingOption[];
  maxPrice?: PricingOption; // computed max price
}

export interface SubCategoryWithServices {
  id: number;
  sub_category_name: string;
  photos: string[];
  description: string;
  services: ServiceWithPricing[];
}

export interface BookingDetails {
  category?: Category;
  selectedServices?: ServiceWithPricing[]; // Multiple services
  selectedPets?: Pets[]; // Multiple pets
  connections?: ServicePetConnection[]; // Service-pet connections (cart)
  service?: Service; // Keep for backward compatibility
  groomerType?: GroomerType;
  selectedPricing?: PricingOption;
  address?: Address;
  pets?: Pets[];
  slots?: { date: string; time: string }[];
  notes?: string;
  nature?: string;
  health_conditions?: string;
  skin_condition?: string;
  comments?: string;
  booking?: any;
  appointment_time_slot?: string;
  payment_method?: string;
  selectedAddons?: {
    id: number;
    name: string;
    price: number;
  }[];

}
