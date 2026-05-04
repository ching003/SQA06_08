import { Router } from 'express';
import type { JobController } from '../controllers/JobController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';
import { sanitizeInput } from '@core/middleware/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';

interface Dependencies {
  jobController: JobController;
  authMiddleware: AuthMiddleware;
}

export function createJobRoutes({ jobController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);
  const optionalAuth = authMiddleware.optionalAuth.bind(authMiddleware);
  const authorize = authMiddleware.authorize.bind(authMiddleware);

  // Public routes
  // GET /api/jobs - Get all jobs (public with optional filtering)
  router.get('/', optionalAuth, jobController.getAllJobs);

  // GET /api/jobs/search - Search jobs
  router.get('/search', sanitizeInput, optionalAuth, jobController.searchJobs);

  // GET /api/jobs/saved - Get saved jobs (must be before :id route)
  router.get('/saved', authenticate, jobController.getSavedJobs);

  // GET /api/jobs/recommended - Get recommended jobs (candidate only)
  router.get('/recommended', authenticate, jobController.getRecommendedJobs);

  // GET /api/jobs/:id - Get job by ID
  router.get('/:id', optionalAuth, jobController.getJobById);

  // GET /api/jobs/:id/similar - Get similar jobs
  router.get('/:id/similar', jobController.getSimilarJobs);

  // GET /api/jobs/:jobId/recommended-cvs - Get recommended CVs for job (recruiter/admin only)
  router.get('/:jobId/recommended-cvs', authenticate, jobController.getRecommendedCVsForJob);

  // GET /api/jobs/:id/saved - Check if job is saved
  router.get('/:id/saved', authenticate, jobController.checkJobSaved);

  // GET /api/jobs/company/:companyId - Get jobs by company
  router.get('/company/:companyId', optionalAuth, jobController.getJobsByCompany);

  // Protected routes
  // POST /api/jobs - Create job
  router.post('/', authenticate, jobController.createJob);

  // PUT /api/jobs/:id - Update job
  router.put('/:id', authenticate, jobController.updateJob);

  // DELETE /api/jobs/:id - Delete job
  router.delete('/:id', authenticate, jobController.deleteJob);

  // POST /api/jobs/:id/close - Close job
  router.post('/:id/close', authenticate, jobController.closeJob);

  // POST /api/jobs/:id/repost - Repost job
  router.post('/:id/repost', authenticate, jobController.repostJob);

  // POST /api/jobs/:id/approve - Approve job (admin only)
  router.post('/:id/approve', authenticate, authorize(UserRole.ADMIN), jobController.approveJob);

  // POST /api/jobs/:id/reject - Reject job (admin only)
  router.post('/:id/reject', authenticate, authorize(UserRole.ADMIN), jobController.rejectJob);

  // POST /api/jobs/:id/lock - Lock job (admin only)
  router.post('/:id/lock', authenticate, authorize(UserRole.ADMIN), jobController.lockJob);

  // POST /api/jobs/:id/unlock - Unlock job (admin only)
  router.post('/:id/unlock', authenticate, authorize(UserRole.ADMIN), jobController.unlockJob);

  // POST /api/jobs/:id/save - Save job
  router.post('/:id/save', authenticate, jobController.saveJob);

  // DELETE /api/jobs/:id/save - Unsave job
  router.delete('/:id/save', authenticate, jobController.unsaveJob);

  return router;
}
