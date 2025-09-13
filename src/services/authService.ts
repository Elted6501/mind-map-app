import { apiClient, ApiResponse } from './apiClient';
import { SecureTokenManager, InputValidator } from '@/utils/security';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

export class AuthService {
  // Register a new user
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Validate input
    if (!InputValidator.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    const passwordValidation = InputValidator.isStrongPassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    // Store the token securely
    SecureTokenManager.setToken(response.data.token);
    
    return response.data;
  }

  // Login user
  static async login(data: LoginRequest): Promise<AuthResponse> {
    // Validate input
    if (!InputValidator.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    // Store the token securely
    SecureTokenManager.setToken(response.data.token);
    
    return response.data;
  }

  // Logout user
  static logout(): void {
    SecureTokenManager.clearToken();
  }

  // Get current user profile
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    // Validate email if provided
    if (data.email && !InputValidator.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password if provided
    if (data.password) {
      const passwordValidation = InputValidator.isStrongPassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
    }
    
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  // Delete user account
  static async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>('/auth/account');
    SecureTokenManager.clearToken();
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return SecureTokenManager.isAuthenticated();
  }

  // Get stored token
  static getToken(): string | null {
    return SecureTokenManager.getToken();
  }
}