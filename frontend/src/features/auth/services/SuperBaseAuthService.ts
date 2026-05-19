// src/features/auth/services/SupabaseAuthService.ts
import { AuthService } from './AuthService';

export class SupabaseAuthService implements AuthService {
  constructor(private client: any) {}
  async signIn(email: string) {
    await this.client.auth.signInWithOtp({ email });
  }
  async signUp(email: string, profile?: any) {
    await this.client.auth.signInWithOtp({ email });
    // Optionally persist profile to DB after verification
  }
  async verifyOtp(email: string, otp: string) {
    await this.client.auth.verifyOtp({ email, token: otp, type: 'email' });
  }
}
