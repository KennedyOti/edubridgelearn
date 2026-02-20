// app/lib/services/auth.service.ts

import { api } from "../api/axios";
import { endpoints } from "../api/endpoints";
import { User, AuthResponse } from "@/types/auth.types";

export const authService = {
  /** Register a new user */
  register: (data: any) => api.post(endpoints.register, data),

  /** Login user: backend sets HTTP-only cookie */
  login: async (data: any): Promise<User> => {
    const res = await api.post<AuthResponse>(endpoints.login, data);
    return res.data.user; // cookie is already set by backend
  },

  /** Logout user: backend clears cookie */
  logout: () => api.post(endpoints.logout),

  /** Get current logged-in user */
  getUser: async (): Promise<User> => {
    const res = await api.get<User>(endpoints.user); // cookie sent automatically
    return res.data;
  },

  /** Email verification */
  verifyEmail: (queryString: string) => 
    api.get(`${endpoints.verifyEmail}?${queryString}`),

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
