import { Router } from 'express';
import type { CompanyController } from '../controllers/CompanyController.js';
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { uploadCompanyFiles, uploadCompanyUpdateFiles, uploadSingle } from '@core/middleware/uploadMiddleware.js';

interface CompanyRoutesDependencies {
  companyController: CompanyController;
  authMiddleware: AuthMiddleware;
}

export function createCompanyRoutes({ companyController, authMiddleware }: CompanyRoutesDependencies): Router {
  const router = Router();

  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================

  // GET /api/companies - Get all companies (public, but with optional auth for admin features)
  router.get('/', authMiddleware.optionalAuth, companyController.getAllCompanies);

  // GET /api/companies/:id - Get company by ID
  router.get('/:id', authMiddleware.authenticate, companyController.getCompanyById);

  // ============================================
  // INVITATION ROUTES (For invited users)
  // Must be defined before /:id routes to avoid conflicts
  // ============================================

  // POST /api/companies/invitations/:invitationId/accept - Accept invitation
  router.post(
    '/invitations/:invitationId/accept',
    authMiddleware.authenticate,
    companyController.acceptInvitation
  );

  // POST /api/companies/invitations/:invitationId/reject - Reject invitation
  router.post(
    '/invitations/:invitationId/reject',
    authMiddleware.authenticate,
    companyController.rejectInvitation
  );

  // ============================================
  // AUTHENTICATED ROUTES (Require authentication)
  // ============================================

  // POST /api/companies/register - Register new company
  router.post(
    '/register',
    authMiddleware.authenticate,
    uploadCompanyFiles,
    companyController.registerCompany
  );

  // ============================================
  // ADMIN ROUTES (Require ADMIN role)
  // ============================================

  // PUT /api/companies/:id/approve - Approve company (Admin only)
  router.put(
    '/:id/approve',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    companyController.approveCompany
  );

  // PUT /api/companies/:id/reject - Reject company (Admin only)
  router.put(
    '/:id/reject',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    companyController.rejectCompany
  );

  // PUT /api/companies/:id/lock - Lock company (Admin only)
  router.put(
    '/:id/lock',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    companyController.lockCompany
  );

  // PUT /api/companies/:id/unlock - Unlock company (Admin only)
  router.put(
    '/:id/unlock',
    authMiddleware.authenticate,
    authMiddleware.authorize(UserRole.ADMIN),
    companyController.unlockCompany
  );

  // ============================================
  // COMPANY MANAGEMENT ROUTES (Require company membership)
  // ============================================

  // PUT /api/companies/:id - Update company (with optional logo and banner upload)
  router.put(
    '/:id',
    authMiddleware.authenticate,
    uploadCompanyUpdateFiles,
    companyController.updateCompany
  );

  // DELETE /api/companies/:id - Delete company
  router.delete(
    '/:id',
    authMiddleware.authenticate,
    companyController.deleteCompany
  );

  // PUT /api/companies/:id/logo - Upload logo
  router.put(
    '/:id/logo',
    authMiddleware.authenticate,
    uploadSingle('image'),
    companyController.uploadLogo
  );

  // PUT /api/companies/:id/banner - Upload banner
  router.put(
    '/:id/banner',
    authMiddleware.authenticate,
    uploadSingle('image'),
    companyController.uploadBanner
  );

  // ============================================
  // MEMBER MANAGEMENT ROUTES
  // ============================================

  // GET /api/companies/:id/members - List members
  router.get(
    '/:id/members',
    authMiddleware.authenticate,
    companyController.listMembers
  );

  // POST /api/companies/:id/members/invite - Invite member
  router.post(
    '/:id/members/invite',
    authMiddleware.authenticate,
    companyController.inviteMember
  );

  // GET /api/companies/:id/members/invitations - List invitations
  router.get(
    '/:id/members/invitations',
    authMiddleware.authenticate,
    companyController.listInvitations
  );

  // DELETE /api/companies/:id/members/invitations/:invitationId - Cancel invitation
  router.delete(
    '/:id/members/invitations/:invitationId',
    authMiddleware.authenticate,
    companyController.cancelInvitation
  );

  // PUT /api/companies/:id/members/:memberId/role - Update member role
  router.put(
    '/:id/members/:memberId/role',
    authMiddleware.authenticate,
    companyController.updateMemberRole
  );

  // DELETE /api/companies/:id/members/:memberId - Delete member
  router.delete(
    '/:id/members/:memberId',
    authMiddleware.authenticate,
    companyController.deleteMember
  );

  return router;
}
