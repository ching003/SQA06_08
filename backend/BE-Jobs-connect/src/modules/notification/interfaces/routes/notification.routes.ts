import { Router } from 'express';
import type { NotificationController } from '../controllers/NotificationController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';

interface Dependencies {
  notificationController: NotificationController;
  authMiddleware: AuthMiddleware;
}

export function createNotificationRoutes({ notificationController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);

  // All notification routes require authentication

  // GET /api/notifications/my - Get my notifications
  router.get('/my', authenticate, notificationController.getMyNotifications);

  // GET /api/notifications/unread-count - Get unread notifications count
  router.get('/unread-count', authenticate, notificationController.getUnreadCount);

  // PATCH /api/notifications/mark-all-read - Mark all notifications as read
  router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

  // DELETE /api/notifications/read - Delete all read notifications
  router.delete('/read', authenticate, notificationController.deleteAllReadNotifications);

  // GET /api/notifications/:id - Get notification by ID
  router.get('/:id', authenticate, notificationController.getNotificationById);

  // PATCH /api/notifications/:id/read - Mark notification as read
  router.patch('/:id/read', authenticate, notificationController.markAsRead);

  // DELETE /api/notifications/:id - Delete notification
  router.delete('/:id', authenticate, notificationController.deleteNotification);

  return router;
}
