export type PublicRole = "student" | "tutor" | "contributor";

export type SystemRole = PublicRole | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: SystemRole;
  email_verified_at: string | null;
  approved_at: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
