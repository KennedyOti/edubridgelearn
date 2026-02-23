// app/lib/services/auth.service.ts

import { api } from "../api/axios";
import { endpoints } from "../api/endpoints";
import { User, AuthResponse } from "@/types/auth.types";


interface VerifyEmailPayload {
  email: string;
  otp: string;
}

interface VerifyEmailResponse {
  message: string;
}



export const authService = {
  /** Register a new user */
  register: (data: any) => api.post(endpoints.register, data),

  /** Login user: backend sets HTTP-only cookie */
  login: async (data: any): Promise<User> => {
    const res = await api.post<AuthResponse>(endpoints.login, data);
    return res.data.user; 
  },

  /** Logout user: backend clears cookie */
  logout: () => api.post(endpoints.logout),

  /** Get current logged-in user */
  getUser: async (): Promise<User> => {
    const res = await api.get<User>(endpoints.user); // cookie sent automatically
    return res.data;
  },

/** Verify email using OTP */
/* verifyEmail: (data: { userId: string; otp: string }) =>
  api.post(endpoints.verifyEmail, data), */
verifyEmail: (data: VerifyEmailPayload) =>
  api.post<VerifyEmailResponse>(endpoints.verifyEmail, data),

/** Resend OTP */
resendOtp: (email: string) =>
  api.post(endpoints.resendVerificationPublic, { email }),

  /** Resend verification for logged-in user */
  resendVerification: () => api.post(endpoints.resendVerification),

  /** Resend verification for public user by email */
  resendVerificationPublic: (email: string) =>
    api.post(endpoints.resendVerificationPublic, { email }),

  /** Forgot password request */
  forgotPassword: (email: string) =>
    api.post(endpoints.forgotPassword, { email }),

  /** Reset password with token */
  resetPassword: (data: any) =>
    api.post(endpoints.resetPassword, data),
};