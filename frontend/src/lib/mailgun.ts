import { supabase } from './supabase';

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email via Edge Function
export const sendOTPEmail = async (email: string, otp: string) => {
  console.log('🚀 Starting OTP email send process...');
  console.log('Target email:', email);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { email, otp }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error('Failed to send OTP email');
    }

    console.log('✅ OTP email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw error;
  }
};

interface BookingEmailData {
  id: string;
  service: { name: string };
  sub_service: { name: string };
  groomer_type: { name: string };
  pet: { name: string };
  address: { label: string; address: string };
  booking_date: string;
  booking_time: string;
  total_price: number;
}

export const sendBookingConfirmationEmail = async (email: string, booking: BookingEmailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: { email, booking }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error('Failed to send booking confirmation email');
    }

    console.log('✅ Booking confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    throw error;
  }
};