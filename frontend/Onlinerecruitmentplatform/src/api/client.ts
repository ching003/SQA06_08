/**
 * API Client
 * Axios instance với interceptors cho authentication và error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './config';
import { ApiResponse, ErrorResponse } from './types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
  },
});

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If response is a blob (e.g., PDF export), return the blob directly
    if (response.data instanceof Blob) {
      return response.data;
    }
    
    // Return data directly if it's wrapped in ApiResponse
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Return ApiResponse directly (not AxiosResponse)
      // Type assertion needed because interceptor expects AxiosResponse but we return ApiResponse
      return response.data as any;
    }
    // For non-standard responses, return the full response
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle other errors
    const errorResponse: ErrorResponse = {
      success: false,
      error: error.response?.data?.error || error.message || 'An error occurred',
      message: error.response?.data?.message,
      details: error.response?.data?.details,
    };

    return Promise.reject(errorResponse);
  }
);

// Helper function to handle API calls
export async function apiRequest<T>(
  request: Promise<ApiResponse<T>>
): Promise<T> {
  try {
    const response = await request;
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Request failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

// Helper to cast axios response to ApiResponse (for TypeScript)
export function asApiResponse<T>(response: any): ApiResponse<T> {
  return response as ApiResponse<T>;
}

export default apiClient;

