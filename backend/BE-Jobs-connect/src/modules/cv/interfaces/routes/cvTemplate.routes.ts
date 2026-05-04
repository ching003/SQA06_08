import { Router } from 'express';
import type { CVTemplateController } from '../controllers/CVTemplateController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';
import { uploadTemplateFiles } from '@core/middleware/uploadMiddleware.js';
import { UserRole } from '@modules/user/domain/enums/index.js';

interface Dependencies {
  cvTemplateController: CVTemplateController;
  authMiddleware: AuthMiddleware;
}

export function createCVTemplateRoutes({ cvTemplateController, authMiddleware }: Dependencies): Router {
  const router = Router();

  // Auth middleware
  const authenticate = authMiddleware.authenticate.bind(authMiddleware);
  const authorizeAdmin = authMiddleware.authorize(UserRole.ADMIN);

  // Public routes
  // GET /api/cv-templates/active - Get active templates (public)
  router.get('/active', cvTemplateController.getActiveTemplates);

  // Protected routes
  // GET /api/cv-templates - Get all templates
  router.get('/', authenticate, cvTemplateController.getAllTemplates);

  // GET /api/cv-templates/:id - Get template by ID
  router.get('/:id', authenticate, cvTemplateController.getTemplateById);

  // Admin only routes
  // POST /api/cv-templates - Create template (admin only)
  // Accepts multipart/form-data with optional 'template' (HTML) and 'preview' (image) files
  router.post('/', authenticate, authorizeAdmin, uploadTemplateFiles, cvTemplateController.createTemplate);

  // PUT /api/cv-templates/:id - Update template (admin only)
  // Accepts multipart/form-data with optional 'template' (HTML) and 'preview' (image) files
  router.put('/:id', authenticate, authorizeAdmin, uploadTemplateFiles, cvTemplateController.updateTemplate);

  // DELETE /api/cv-templates/:id - Delete template (admin only)
  router.delete('/:id', authenticate, authorizeAdmin, cvTemplateController.deleteTemplate);

  // PUT /api/cv-templates/:id/activate - Activate template (admin only)
  router.put('/:id/activate', authenticate, authorizeAdmin, cvTemplateController.activateTemplate);

  // PUT /api/cv-templates/:id/deactivate - Deactivate template (admin only)
  router.put('/:id/deactivate', authenticate, authorizeAdmin, cvTemplateController.deactivateTemplate);

  return router;
}
