import apiClient from './client';
import type { RegisterInput, LoginInput } from '../validations/auth';

export interface User {
  id: string;
  centerName: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trialEndsAt?: string | null;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const authApi = {
  // Register
  register: async (data: RegisterInput): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginInput): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Refresh token
  refresh: async (): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/refresh');
    return response.data;
  },
};
