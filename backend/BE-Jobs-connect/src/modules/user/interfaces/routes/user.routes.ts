import { Router } from 'express';
import type { UserController } from '../controllers/UserController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

interface UserRoutesDependencies {
  userController: UserController;
  authMiddleware: AuthMiddleware;
}

export function createUserRoutes({ userController, authMiddleware }: UserRoutesDependencies): Router {
  const router = Router();

  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================

  // POST /api/users/register - Register new user
  router.post('/register', userController.register);

  // POST /api/users/login - Login
  router.post('/login', userController.login);

  // POST /api/users/logout - Logout (requires authentication)
  router.post('/logout', authMiddleware.authenticate, userController.logout);

  // ============================================
  // ADMIN ONLY ROUTES (Require ADMIN role)
  // Must be defined before /:id routes to avoid conflicts
  // ============================================

  // GET /api/users - Get all users (Admin only)
  router.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.getAllUsers
  );

  // POST /api/users - Create user (Admin only)
  router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.createUser
  );

  // ============================================
  // AUTHENTICATED ROUTES (Require authentication)
  // Specific routes must come before /:id routes
  // ============================================

  // GET /api/users/:id/info - Get user info
  router.get('/:id/info', authMiddleware.authenticate, userController.getUserInfo);

  // GET /api/users/:id/age - Get user age
  router.get('/:id/age', authMiddleware.authenticate, userController.getAge);

  // PUT /api/users/:id/profile - Update profile
  router.put('/:id/profile', authMiddleware.authenticate, userController.updateProfile);

  // PUT /api/users/:id/password - Change password
  router.put('/:id/password', authMiddleware.authenticate, userController.changePassword);

  // POST /api/users/:id/avatar - Upload avatar
  router.post(
    '/:id/avatar',
    authMiddleware.authenticate,
    upload.single('avatar'),
    userController.uploadAvatar
  );

  // PUT /api/users/:id/status - Update status (user or admin)
  router.put('/:id/status', authMiddleware.authenticate, userController.updateStatus);

  // PUT /api/users/:id/lock - Lock account (Admin only)
  router.put(
    '/:id/lock',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.lockAccount
  );

  // PUT /api/users/:id/unlock - Unlock account (Admin only)
  router.put(
    '/:id/unlock',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.unlockAccount
  );

  // GET /api/users/:id - Get user by ID
  router.get('/:id', authMiddleware.authenticate, userController.getUserById);

  // PUT /api/users/:id - Update user (Admin only)
  router.put(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.updateUser
  );

  // DELETE /api/users/:id - Delete user (Admin only)
  router.delete(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.deleteUser
  );

  // GET /admin/activities/recent - Get recent activities (Admin only)
  router.get(
    '/admin/activities/recent',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    userController.getRecentActivities
  );

  return router;
}
