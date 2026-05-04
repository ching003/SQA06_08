/**
 * Notification Service
 * API calls cho notification management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';
import { Notification } from '../../lib/types';

export interface NotificationSearchParams extends PaginationParams {
  type?: string;
  isRead?: boolean;
}

class NotificationService {
  /**
   * Get my notifications
   */
  async getMyNotifications(params?: NotificationSearchParams): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
      API_ENDPOINTS.NOTIFICATIONS.MY,
      { params }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get notifications');
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<Notification> {
    const response = await apiClient.get<ApiResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get notification');
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get unread count');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to mark notification as read');
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await apiClient.patch<ApiResponse<{ count: number }>>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    
    if (response.success) {
      // API may return data or just success message
      return response.data || { count: 0 };
    }
    
    throw new Error(response.message || 'Failed to mark all notifications as read');
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(id)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllReadNotifications(): Promise<{ deletedCount: number }> {
    const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE_READ
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to delete all read notifications');
  }
}

export const notificationService = new NotificationService();

