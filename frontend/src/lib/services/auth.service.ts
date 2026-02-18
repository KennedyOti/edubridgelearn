import { api } from "../api/axios";
import { endpoints } from "../api/endpoints";
import { AuthResponse } from "@/types/auth.types";

export const authService = {
  register: (data: any) => api.post(endpoints.register, data),

  login: async (data: any) => {
    const res = await api.post<AuthResponse>(endpoints.login, data);
    return res.data;
  },

  logout: () => api.post(endpoints.logout),

  getUser: async () => {
    const res = await api.get(endpoints.user);
    return res.data;
  },

  verifyEmail: (id: string, hash: string, query: string) =>
    api.get(`${endpoints.verifyEmail}/${id}/${hash}?${query}`),

  resendVerification: () =>
    api.post(endpoints.resendVerification),

  resendVerificationPublic: (email: string) =>
    api.post(endpoints.resendVerificationPublic, { email }),

  forgotPassword: (email: string) =>
    api.post(endpoints.forgotPassword, { email }),

  resetPassword: (data: any) =>
    api.post(endpoints.resetPassword, data),
};
