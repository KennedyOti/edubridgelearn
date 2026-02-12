import api from './axios'
import { API_ENDPOINTS } from './endpoints'

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'student' | 'tutor' | 'contributor'
}

export interface LoginData {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  password: string
  password_confirmation: string
  token: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  email_verified_at?: string
  approved_at?: string
}

export interface ResendVerificationData {
  email: string
}

class AuthAPI {
  // Register
  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data)
    return response.data
  }

  // Login
  async login(data: LoginData): Promise<{ message: string; user: User; token: string }> {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data)
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    
    return response.data
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    
    // Clear token from localStorage
    localStorage.removeItem('auth_token')
    
    return response.data
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get(API_ENDPOINTS.AUTH.USER)
    return response.data
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
    return response.data
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
    return response.data
  }

  // Resend verification email (authenticated)
  async resendVerification(): Promise<{ message: string }> {
    const response = await api.post(
      API_ENDPOINTS.AUTH.EMAIL_VERIFICATION.RESEND,
    )
    return response.data
  }

  // Resend verification email (unauthenticated - you need to create this endpoint)
  async resendVerificationToEmail(email: string): Promise<{ message: string }> {
    const response = await api.post('/email/resend-unauthenticated', { email })
    return response.data
  }

  // Verify email via link
  /* async verifyEmail(id: string, hash: string): Promise<{ message: string }> {
    const response = await api.get(API_ENDPOINTS.AUTH.EMAIL_VERIFICATION.VERIFY(id, hash));
    return response.data;
  } */

  async verifyEmail(id: string, hash: string, query?: string) {
    const url = `/email/verify/${id}/${hash}${query ? `?${query}` : ''}`
    const response = await api.get(url)
    return response.data
  }
}

export const authAPI = new AuthAPI()
