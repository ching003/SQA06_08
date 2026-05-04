/**
 * User Service
 * API calls cho user authentication và profile management
 */

import apiClient from '../client';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../config';
import { ApiResponse, LoginResponse, RegisterResponse, PaginationParams } from '../types';
import { User } from '../../lib/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  location?: string;
  bio?: string;
  openForOpportunities?: boolean;
  avatarUrl?: string;
}

// Admin interfaces
export interface CreateUserRequest {
  email: string;
  password: string;
  fullName?: string;
  role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING' | 'SUSPENDED';
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING' | 'SUSPENDED';
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
}

export interface GetUsersParams extends PaginationParams {
  role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  search?: string;
  orderBy?: string;
}

/**
 * Normalize companyMember data from API response to match frontend types
 * API returns: { role, company: { id, name } }
 * Frontend expects: { companyRole, companyId, company }
 */
function normalizeCompanyMember(companyMember: any): any {
  if (!companyMember) return undefined;

  return {
    ...companyMember,
    // Map API "role" to frontend "companyRole"
    companyRole: companyMember.companyRole || companyMember.role,
    // Map API "company.id" to frontend "companyId"
    companyId: companyMember.companyId || companyMember.company?.id,
  };
}

class UserService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success && response.data) {
      // Store token and user using constants
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  }

  /**
   * Logout user (client-side only, server doesn't need to do anything for JWT)
   */
  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  /**
   * Get current user profile
   * Uses stored user ID or decodes JWT token to get user ID, then fetches user data
   */
  async getProfile(): Promise<User> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      throw new Error('No authentication token found');
    }

    // First, try to get user ID from stored user
    let userId: string | null = null;
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
    } catch (error) {
      // Ignore parse errors
    }

    // If no stored user ID, decode from token
    if (!userId) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload.userId || payload.sub;
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    // Fetch user by ID
    const response = await apiClient.get<ApiResponse<User>>(
      `/api/users/${userId}`
    );

    // Response interceptor returns ApiResponse directly, so response is ApiResponse<User>
    const apiResponse = response as any;
    if (apiResponse.success && apiResponse.data) {
      // Normalize companyMember to match frontend types
      const user = apiResponse.data as User;
      if (user.companyMember) {
        user.companyMember = normalizeCompanyMember(user.companyMember);
      }
      return user;
    }

    throw new Error(apiResponse.message || 'Failed to get profile');
  }

  /**
   * Update user profile
   * Requires user ID - gets from stored user or token
   */
  async updateProfile(data: UpdateProfileRequest, userId?: string): Promise<User> {
    // Get user ID if not provided
    if (!userId) {
      // Try to get from stored user
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userId = user.id;
        }
      } catch (error) {
        // Ignore parse errors
      }

      // If still no userId, try to decode from token
      if (!userId) {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id || payload.userId || payload.sub;
          } catch (error) {
            console.error('Failed to decode token:', error);
          }
        }
      }

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
    }

    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE(userId),
      data
    );
    
    if (response.success && response.data) {
      // Update stored user
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update profile');
  }

  /**
   * Refresh token (if implemented)
   */
  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    
    if (response.success && response.data) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.message || 'Token refresh failed');
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(params?: GetUsersParams): Promise<{ users: User[]; pagination: any }> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.USERS.BASE,
      { params }
    );
    
    console.log('[userService.getAllUsers] Raw response:', response);
    
    // Response interceptor returns response.data directly if it has 'success' property
    // API returns: { success: true, data: User[], pagination: {...} }
    if (response && response.success) {
      // Check if data is array and pagination exists at root level
      if (Array.isArray(response.data) && response.pagination) {
        console.log('[userService.getAllUsers] Format 1: data array with pagination at root');
        return {
          users: response.data,
          pagination: response.pagination,
        };
      }
      // Fallback: if data is already in expected format
      if (response.data && response.data.users) {
        console.log('[userService.getAllUsers] Format 2: nested users');
        return response.data;
      }
    }
    
    console.error('[userService.getAllUsers] Unexpected response format:', response);
    throw new Error(response?.message || 'Failed to get users');
  }

  /**
   * Create user (Admin only)
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BASE,
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create user');
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(userId),
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update user');
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.USERS.BY_ID(userId)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  }

  /**
   * Lock user account (Admin only)
   */
  async lockUser(userId: string): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.LOCK(userId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to lock user');
  }

  /**
   * Unlock user account (Admin only)
   */
  async unlockUser(userId: string): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UNLOCK(userId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to unlock user');
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(userId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user');
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, avatarFile: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      API_ENDPOINTS.AUTH.UPLOAD_AVATAR(userId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.success && response.data) {
      // Update stored user with new avatar URL
      const currentUser = localStorage.getItem(USER_STORAGE_KEY);
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.avatarUrl = response.data.avatarUrl;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to upload avatar');
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD(userId),
      {
        oldPassword,
        newPassword,
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  /**
   * Get user info (detailed user information)
   */
  async getUserInfo(userId: string): Promise<User> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.USERS.INFO(userId)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to get user info');
  }

  /**
   * Get user age
   */
  async getUserAge(userId: string): Promise<{ age: number }> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.USERS.AGE(userId)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to get user age');
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING' | 'SUSPENDED'): Promise<User> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.USERS.STATUS(userId),
      { status }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to update user status');
  }
}

export const userService = new UserService();

