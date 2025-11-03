import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { ApiResponse } from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  nim: string;
  email: string;
  password: string;
  phone?: string;
  faculty?: string;
  program?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      await this.saveAuthData(response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Login failed');
  }

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      await this.saveAuthData(response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Registration failed');
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    if (response.data.success && response.data.data) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch profile');
  }

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    if (response.data.success && response.data.data) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update profile');
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  // Save auth data to storage
  private async saveAuthData(data: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();
