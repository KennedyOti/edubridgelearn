"use client";

import { createContext, useEffect, useState } from "react";
import { User } from "@/types/auth.types";
import { authService } from "@/lib/services/auth.service";
import { setToken, getToken, removeToken } from "@/lib/utils/storage";
import { setupInterceptors } from "@/lib/api/interceptors";

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

  useEffect(() => {
    setupInterceptors();
    const init = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getUser();
        setUser(userData);
      } catch {
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (data: any) => {
    const res = await authService.login(data);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
