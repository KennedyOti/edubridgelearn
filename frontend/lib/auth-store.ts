import { create } from "zustand";
import api from "./api";

export interface ContributorProfile {
  bio: string | null;
  expertise_areas: string[] | null;
  verification_status: "pending" | "approved" | "rejected";
  total_resources: number;
}

export interface StudentProfile {
  education_level: string | null;
  curriculum: string | null;
  grade: string | null;
  institution: string | null;
  subjects: string[] | null;
  learning_goals: string[] | null;
  preferred_schedule: Record<string, unknown> | null;
  onboarding_completed: boolean;
}

export interface TutorProfile {
  bio: string | null;
  qualifications: { title: string; institution?: string; year?: number }[] | null;
  experience_years: number | null;
  subjects: string[] | null;
  hourly_rate: string | null;
  rate_currency: string;
  intro_video_url: string | null;
  teaching_methodology: string | null;
  verification_status: "pending" | "approved" | "rejected" | "revision_requested";
  rejection_reason?: string;
  verified_at: string | null;
  avg_rating: number;
  total_sessions: number;
  availability: Record<string, unknown> | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "student" | "tutor" | "contributor" | "moderator" | "admin" | "super_admin";
  status: "active" | "pending_approval" | "suspended" | "deactivated";
  country: string | null;
  timezone: string;
  avatar_url: string | null;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  student_profile?: StudentProfile | null;
  tutor_profile?: TutorProfile | null;
  contributor_profile?: ContributorProfile | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;

  login: (email: string, password: string) => Promise<{ requires_2fa: boolean }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: "student" | "tutor" | "contributor";
  country?: string;
  timezone?: string;
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isLoading: false,
  isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false,

  setAuth: (user, token) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (userData) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      set({ user: updated });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const user = data.data.user;
      const token = data.data.token;
      get().setAuth(user, token);
      return { requires_2fa: data.data.requires_2fa };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/register", data);
      const user = response.data.data.user;
      const token = response.data.data.token;
      get().setAuth(user, token);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      get().clearAuth();
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get("/users/me");
      const user = data.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch {
      get().clearAuth();
    }
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data.meta.message;
  },

  resetPassword: async (resetData) => {
    await api.post("/auth/reset-password", resetData);
  },
}));
