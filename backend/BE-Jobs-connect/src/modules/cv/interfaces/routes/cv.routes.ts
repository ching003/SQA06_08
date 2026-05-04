import { Router } from 'express';
import type { CVController } from '../controllers/CVController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';

interface Dependencies {
  cvController: CVController;
  authMiddleware: AuthMiddleware;
}

export function createCVRoutes({ cvController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);

  // CV routes
  // GET /api/cvs/search - Search CVs (must be before /:id)
  router.get('/search', authenticate, cvController.searchCVs);

  // GET /api/cvs/saved - Get saved CVs (must be before /:id)
  router.get('/saved', authenticate, cvController.getSavedCVs);

  // POST /api/cvs - Create CV
  router.post('/', authenticate, cvController.createCV);

  // GET /api/cvs - Get all CVs
  router.get('/', authenticate, cvController.getAllCVs);

  // GET /api/cvs/user/:userId - Get CVs by user (must be before /:id)
  router.get('/user/:userId', authenticate, cvController.getCVsByUser);

  // GET /api/cvs/:id - Get CV by ID
  router.get('/:id', authenticate, cvController.getCVById);

  // PUT /api/cvs/:id - Update CV
  router.put('/:id', authenticate, cvController.updateCV);

  // DELETE /api/cvs/:id - Delete CV
  router.delete('/:id', authenticate, cvController.deleteCV);

  // POST /api/cvs/:id/duplicate - Duplicate CV
  router.post('/:id/duplicate', authenticate, cvController.duplicateCV);

  // PUT /api/cvs/:id/main - Set CV as main
  router.put('/:id/main', authenticate, cvController.setAsMain);

  // POST /api/cvs/:id/export - Export CV to PDF
  router.post('/:id/export', authenticate, cvController.exportCV);

  // POST /api/cvs/:id/save - Save CV
  router.post('/:id/save', authenticate, cvController.saveCV);

  // DELETE /api/cvs/:id/save - Unsave CV
  router.delete('/:id/save', authenticate, cvController.unsaveCV);

  // PUT /api/cvs/:id/save/notes - Update saved CV notes
  router.put('/:id/save/notes', authenticate, cvController.updateSavedCVNotes);

  // GET /api/cvs/:id/saved - Check if CV is saved
  router.get('/:id/saved', authenticate, cvController.checkCVSaved);

  // GET /api/cvs/:cvId/recommended-jobs - Get recommended jobs for CV
  router.get('/:cvId/recommended-jobs', authenticate, cvController.getRecommendedJobsForCV);

  return router;
}
