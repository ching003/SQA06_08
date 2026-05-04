import { Router } from 'express';
import { container } from '@core/container/container.js';

// Routes from modules
import { createUserRoutes } from '@modules/user/interfaces/routes/user.routes.js';
import { createCompanyRoutes } from '@modules/company/interfaces/routes/company.routes.js';
import { createCVRoutes } from '@modules/cv/interfaces/routes/cv.routes.js';
import { createCVTemplateRoutes } from '@modules/cv/interfaces/routes/cvTemplate.routes.js';
import { createJobRoutes } from '@modules/job/interfaces/routes/job.routes.js';
import { createApplicationRoutes, createJobApplicationsRoutes } from '@modules/application/interfaces/routes/application.routes.js';
import { createNotificationRoutes } from '@modules/notification/interfaces/routes/notification.routes.js';

// Controller types from modules
import type { UserController } from '@modules/user/interfaces/controllers/UserController.js';
import type { CompanyController } from '@modules/company/interfaces/controllers/CompanyController.js';
import type { CVController } from '@modules/cv/interfaces/controllers/CVController.js';
import type { CVTemplateController } from '@modules/cv/interfaces/controllers/CVTemplateController.js';
import type { JobController } from '@modules/job/interfaces/controllers/JobController.js';
import type { ApplicationController } from '@modules/application/interfaces/controllers/ApplicationController.js';
import type { NotificationController } from '@modules/notification/interfaces/controllers/NotificationController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';

const router = Router();

// Get dependencies from container
const userController = container.resolve<UserController>('userController');
const companyController = container.resolve<CompanyController>('companyController');
const cvController = container.resolve<CVController>('cvController');
const cvTemplateController = container.resolve<CVTemplateController>('cvTemplateController');
const jobController = container.resolve<JobController>('jobController');
const applicationController = container.resolve<ApplicationController>('applicationController');
const notificationController = container.resolve<NotificationController>('notificationController');
const authMiddleware = container.resolve<AuthMiddleware>('authMiddleware');

// Register User routes
router.use('/users', createUserRoutes({ userController, authMiddleware }));

// Register Company routes
router.use('/companies', createCompanyRoutes({ companyController, authMiddleware }));

// Register CV routes
router.use('/cvs', createCVRoutes({ cvController, authMiddleware }));

// Register CV Template routes
router.use('/cv-templates', createCVTemplateRoutes({ cvTemplateController, authMiddleware }));

// Register Job routes
router.use('/jobs', createJobRoutes({ jobController, authMiddleware }));

// Register Application routes
router.use('/applications', createApplicationRoutes({ applicationController, authMiddleware }));

// Register Job Applications routes (nested under /jobs)
router.use('/jobs', createJobApplicationsRoutes({ applicationController, authMiddleware }));

// Register Notification routes
router.use('/notifications', createNotificationRoutes({ notificationController, authMiddleware }));

// API info route
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'BE-Jobs-Connect API v3.0 (Modular Architecture)',
    version: '3.0.0',
  });
});

export default router;
