import { Router } from 'express';
import type { ApplicationController } from '../controllers/ApplicationController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';

interface Dependencies {
  applicationController: ApplicationController;
  authMiddleware: AuthMiddleware;
}

export function createApplicationRoutes({ applicationController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);

  // All application routes require authentication

  // POST /api/applications - Apply for a job
  router.post('/', authenticate, applicationController.applyJob);

  // GET /api/applications/my - Get my applications
  router.get('/my', authenticate, applicationController.getMyApplications);

  // GET /api/applications/:id - Get application by ID
  router.get('/:id', authenticate, applicationController.getApplicationById);

  // PATCH /api/applications/:id/status - Update application status
  router.patch('/:id/status', authenticate, applicationController.updateStatus);

  // PATCH /api/applications/:id/withdraw - Withdraw application
  router.patch('/:id/withdraw', authenticate, applicationController.withdraw);

  return router;
}

// Job applications route (for getting applications by job)
export function createJobApplicationsRoutes({ applicationController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);

  // GET /api/jobs/:jobId/applications - Get applications for a job
  router.get('/:jobId/applications', authenticate, applicationController.getApplicationsByJob);

  return router;
}
