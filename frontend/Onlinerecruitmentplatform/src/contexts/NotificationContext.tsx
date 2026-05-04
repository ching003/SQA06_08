import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from '../api/services';
import { Notification, UserRole } from '../lib/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await notificationService.getMyNotifications({ page: 1, limit: 50 });
      
      // Handle different response structures
      let notificationsList: Notification[] = [];
      if (response && response.items && Array.isArray(response.items)) {
        notificationsList = response.items;
      } else if (response && (response as any).data?.items && Array.isArray((response as any).data.items)) {
        notificationsList = (response as any).data.items;
      } else if (Array.isArray(response)) {
        notificationsList = response;
      }

      setNotifications(notificationsList);
      
      // Fetch unread count
      try {
        const countResponse = await notificationService.getUnreadCount();
        setUnreadCount(countResponse.unreadCount || 0);
      } catch (error) {
        // Fallback: calculate from notifications list
        setUnreadCount(notificationsList.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Firestore listener for real-time notifications
  useEffect(() => {
    if (!user) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // 1. Listen to user's personal notifications
    // Path: /notifications/user/{userId}
    // Types: COMPANY_APPROVED, COMPANY_REJECTED, COMPANY_INVITATION, APPLICATION_STATUS_CHANGED, etc.
    const userNotificationsRef = collection(db, 'notifications', 'user', user.id);
    const unsubscribeUser = onSnapshot(
      userNotificationsRef,
      (snapshot) => {
        const changes = snapshot.docChanges();
        if (changes.length > 0) {
          console.log('[Notifications] User notifications changed, refreshing...', changes.length, 'changes');
          fetchNotifications();
        }
      },
      (error) => {
        console.error('[Notifications] Firestore user listener error:', error);
        // Fallback to polling on error
        if (!pollingInterval) {
          const interval = setInterval(() => {
            fetchNotifications();
          }, 30000);
          setPollingInterval(interval);
        }
      }
    );
    unsubscribers.push(unsubscribeUser);

    // 2. If user is ADMIN, also listen to admin notifications
    // Path: /notifications/admin/company-request/{companyId}
    if (user.role === UserRole.ADMIN) {
      const adminNotificationsRef = collection(db, 'notifications', 'admin', 'company-request');
      const unsubscribeAdmin = onSnapshot(
        adminNotificationsRef,
        (snapshot) => {
          const changes = snapshot.docChanges();
          if (changes.length > 0) {
            console.log('[Notifications] Admin notifications changed, refreshing...', changes.length, 'changes');
            fetchNotifications();
          }
        },
        (error) => {
          console.error('[Notifications] Firestore admin listener error:', error);
        }
      );
      unsubscribers.push(unsubscribeAdmin);
    }

    // 3. If user is RECRUITER and belongs to a company, listen to company notifications
    // Path: /notifications/company/{companyId}
    // Types: MEMBER_JOINED, APPLICATION_RECEIVED, INVITATION_ACCEPTED, INVITATION_REJECTED
    // API returns company.id (nested) but frontend type expects companyId (flat)
    const companyId = user.companyMember?.companyId || user.companyMember?.company?.id;
    if (user.role === UserRole.RECRUITER && companyId) {
      console.log('[Notifications] Setting up company listener for companyId:', companyId);
      const companyNotificationsRef = collection(db, 'notifications', 'company', companyId);
      const unsubscribeCompany = onSnapshot(
        companyNotificationsRef,
        (snapshot) => {
          const changes = snapshot.docChanges();
          if (changes.length > 0) {
            console.log('[Notifications] Company notifications changed, refreshing...', changes.length, 'changes');
            fetchNotifications();
          }
        },
        (error) => {
          console.error('[Notifications] Firestore company listener error:', error);
        }
      );
      unsubscribers.push(unsubscribeCompany);
    }

    return () => {
      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch (error) {
          // Ignore errors during cleanup
          console.debug('Error during notification listener cleanup:', error);
        }
      });
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

