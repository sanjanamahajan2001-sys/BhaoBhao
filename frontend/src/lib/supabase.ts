import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('✅ Creating Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          address: string
          is_predefined: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          address: string
          is_predefined?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          address?: string
          is_predefined?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          created_at?: string
        }
      }
      sub_services: {
        Row: {
          id: string
          service_id: string
          name: string
          base_price: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          name: string
          base_price: number
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          name?: string
          base_price?: number
          created_at?: string
        }
      }
      groomer_types: {
        Row: {
          id: string
          name: string
          description: string
          price_multiplier: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price_multiplier: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price_multiplier?: number
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          service_id: string
          sub_service_id: string
          groomer_type_id: string
          address_id: string
          booking_date: string
          booking_time: string
          total_price: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          sub_service_id: string
          groomer_type_id: string
          address_id: string
          booking_date: string
          booking_time: string
          total_price: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          sub_service_id?: string
          groomer_type_id?: string
          address_id?: string
          booking_date?: string
          booking_time?: string
          total_price?: number
          status?: string
          created_at?: string
        }
      }
      otp_transactions: {
        Row: {
          id: string
          email: string
          otp: string
          expires_at: string
          is_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          otp: string
          expires_at: string
          is_used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          otp?: string
          expires_at?: string
          is_used?: boolean
          created_at?: string
        }
      }
    }
  }
}