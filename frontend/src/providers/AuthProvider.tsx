// src/providers/AuthProvider.tsx

"use client";

import { createContext, useEffect, useState } from "react";
import { User } from "@/types/auth.types";
import { authService } from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user on mount
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await authService.getUser(); // cookie automatically sent
        setUser(userData);
      } catch {
        setUser(null); // no valid cookie or user
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Login: backend sets HTTP-only cookie, returns user
  const login = async (data: any) => {
    try {
      const userData = await authService.login(data); // backend sets cookie
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error; // allow UI to show error
    }
  };

  // Logout: backend clears cookie
  const logout = async () => {
    try {
      await authService.logout(); // backend clears cookie
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
