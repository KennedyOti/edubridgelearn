import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, type User } from '@/lib/api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* useEffect(() => {   // Should be added on logged in pages
    checkAuth();
  }, [checkAuth]); */

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      router.push('/dashboard'); // redirect after login
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: any) => {
    try {
      await authAPI.register(userData);
      router.push('/login?registered=true'); // redirect after registration
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };
}
