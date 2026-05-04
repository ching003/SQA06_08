import type { Request, Response, NextFunction } from 'express';
import type { RegisterCompanyUseCase } from '../../application/use-cases/RegisterCompanyUseCase.js';
import type { ApproveCompanyUseCase } from '../../application/use-cases/ApproveCompanyUseCase.js';
import type { RejectCompanyUseCase } from '../../application/use-cases/RejectCompanyUseCase.js';
import type { LockCompanyUseCase } from '../../application/use-cases/LockCompanyUseCase.js';
import type { UnlockCompanyUseCase } from '../../application/use-cases/UnlockCompanyUseCase.js';
import type { GetCompanyByIdUseCase } from '../../application/use-cases/GetCompanyByIdUseCase.js';
import type { GetAllCompaniesUseCase } from '../../application/use-cases/GetAllCompaniesUseCase.js';
import type { UpdateCompanyUseCase } from '../../application/use-cases/UpdateCompanyUseCase.js';
import type { DeleteCompanyUseCase } from '../../application/use-cases/DeleteCompanyUseCase.js';
import type { UploadLogoUseCase } from '../../application/use-cases/UploadLogoUseCase.js';
import type { UploadBannerUseCase } from '../../application/use-cases/UploadBannerUseCase.js';
import type { ListMembersUseCase } from '../../application/use-cases/ListMembersUseCase.js';
import type { InviteMemberUseCase } from '../../application/use-cases/InviteMemberUseCase.js';
import type { UpdateMemberRoleUseCase } from '../../application/use-cases/UpdateMemberRoleUseCase.js';
import type { DeleteMemberUseCase } from '../../application/use-cases/DeleteMemberUseCase.js';
import type { ListInvitationsUseCase } from '../../application/use-cases/ListInvitationsUseCase.js';
import type { CancelInvitationUseCase } from '../../application/use-cases/CancelInvitationUseCase.js';
import type { AcceptInvitationUseCase } from '../../application/use-cases/AcceptInvitationUseCase.js';
import type { RejectInvitationUseCase } from '../../application/use-cases/RejectInvitationUseCase.js';
import {
  companyIdParamSchema,
  memberIdParamSchema,
  invitationIdParamSchema,
  companyInvitationIdParamSchema,
  registerCompanySchema,
  updateCompanySchema,
  getCompaniesQuerySchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  rejectCompanySchema,
  listInvitationsQuerySchema,
} from '../validators/companyValidators.js';
import { ValidationError, AuthorizationError } from '@shared/domain/errors/index.js';
import { HttpStatus } from '@shared/constants/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';

interface CompanyControllerDependencies {
  registerCompanyUseCase: RegisterCompanyUseCase;
  approveCompanyUseCase: ApproveCompanyUseCase;
  rejectCompanyUseCase: RejectCompanyUseCase;
  lockCompanyUseCase: LockCompanyUseCase;
  unlockCompanyUseCase: UnlockCompanyUseCase;
  getCompanyByIdUseCase: GetCompanyByIdUseCase;
  getAllCompaniesUseCase: GetAllCompaniesUseCase;
  updateCompanyUseCase: UpdateCompanyUseCase;
  deleteCompanyUseCase: DeleteCompanyUseCase;
  uploadLogoUseCase: UploadLogoUseCase;
  uploadBannerUseCase: UploadBannerUseCase;
  listMembersUseCase: ListMembersUseCase;
  inviteMemberUseCase: InviteMemberUseCase;
  updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  deleteMemberUseCase: DeleteMemberUseCase;
  listInvitationsUseCase: ListInvitationsUseCase;
  cancelInvitationUseCase: CancelInvitationUseCase;
  acceptInvitationUseCase: AcceptInvitationUseCase;
  rejectInvitationUseCase: RejectInvitationUseCase;
}

export class CompanyController {
  private readonly registerCompanyUseCase: RegisterCompanyUseCase;
  private readonly approveCompanyUseCase: ApproveCompanyUseCase;
  private readonly rejectCompanyUseCase: RejectCompanyUseCase;
  private readonly lockCompanyUseCase: LockCompanyUseCase;
  private readonly unlockCompanyUseCase: UnlockCompanyUseCase;
  private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase;
  private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase;
  private readonly updateCompanyUseCase: UpdateCompanyUseCase;
  private readonly deleteCompanyUseCase: DeleteCompanyUseCase;
  private readonly uploadLogoUseCase: UploadLogoUseCase;
  private readonly uploadBannerUseCase: UploadBannerUseCase;
  private readonly listMembersUseCase: ListMembersUseCase;
  private readonly inviteMemberUseCase: InviteMemberUseCase;
  private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  private readonly deleteMemberUseCase: DeleteMemberUseCase;
  private readonly listInvitationsUseCase: ListInvitationsUseCase;
  private readonly cancelInvitationUseCase: CancelInvitationUseCase;
  private readonly acceptInvitationUseCase: AcceptInvitationUseCase;
  private readonly rejectInvitationUseCase: RejectInvitationUseCase;

  constructor(deps: CompanyControllerDependencies) {
    this.registerCompanyUseCase = deps.registerCompanyUseCase;
    this.approveCompanyUseCase = deps.approveCompanyUseCase;
    this.rejectCompanyUseCase = deps.rejectCompanyUseCase;
    this.lockCompanyUseCase = deps.lockCompanyUseCase;
    this.unlockCompanyUseCase = deps.unlockCompanyUseCase;
    this.getCompanyByIdUseCase = deps.getCompanyByIdUseCase;
    this.getAllCompaniesUseCase = deps.getAllCompaniesUseCase;
    this.updateCompanyUseCase = deps.updateCompanyUseCase;
    this.deleteCompanyUseCase = deps.deleteCompanyUseCase;
    this.uploadLogoUseCase = deps.uploadLogoUseCase;
    this.uploadBannerUseCase = deps.uploadBannerUseCase;
    this.listMembersUseCase = deps.listMembersUseCase;
    this.inviteMemberUseCase = deps.inviteMemberUseCase;
    this.updateMemberRoleUseCase = deps.updateMemberRoleUseCase;
    this.deleteMemberUseCase = deps.deleteMemberUseCase;
    this.listInvitationsUseCase = deps.listInvitationsUseCase;
    this.cancelInvitationUseCase = deps.cancelInvitationUseCase;
    this.acceptInvitationUseCase = deps.acceptInvitationUseCase;
    this.rejectInvitationUseCase = deps.rejectInvitationUseCase;
  }

  registerCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = registerCompanySchema.safeParse(req.body);
      if (!validation.success) {
        const errors = validation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const logoFile = files?.logo?.[0];
      const documentFile = files?.document?.[0];

      const result = await this.registerCompanyUseCase.execute({
        ...validation.data,
        ownerId: req.userId!,
        logoFile: logoFile
          ? { buffer: logoFile.buffer, originalname: logoFile.originalname, mimetype: logoFile.mimetype }
          : undefined,
        documentFile: documentFile
          ? { buffer: documentFile.buffer, originalname: documentFile.originalname, mimetype: documentFile.mimetype }
          : undefined,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Đăng ký công ty thành công. Đang chờ phê duyệt từ quản trị viên.',
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryValidation = getCompaniesQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        const errors = queryValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const { page, limit, search, status, size, industry, orderBy } = queryValidation.data;

      const result = await this.getAllCompaniesUseCase.execute({
        page,
        limit,
        search,
        status,
        size,
        industry,
        orderBy: orderBy?.split(':')[0],
        orderDirection: orderBy?.split(':')[1] as 'asc' | 'desc' | undefined,
        userRole: req.user?.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.getCompanyByIdUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId,
        userRole: req.user?.role,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const bodyValidation = updateCompanySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        const errors = bodyValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const logoFile = files?.logo?.[0];
      const bannerFile = files?.banner?.[0];

      const result = await this.updateCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
        ...bodyValidation.data,
        logoFile: logoFile
          ? { buffer: logoFile.buffer, originalname: logoFile.originalname, mimetype: logoFile.mimetype }
          : undefined,
        bannerFile: bannerFile
          ? { buffer: bannerFile.buffer, originalname: bannerFile.originalname, mimetype: bannerFile.mimetype }
          : undefined,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Cập nhật công ty thành công' });
    } catch (error) {
      next(error);
    }
  };

  deleteCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.deleteCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  approveCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AuthorizationError('Chỉ quản trị viên mới có thể phê duyệt công ty');
      }

      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.approveCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        adminId: req.userId!,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Phê duyệt công ty thành công' });
    } catch (error) {
      next(error);
    }
  };

  rejectCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AuthorizationError('Chỉ quản trị viên mới có thể từ chối công ty');
      }

      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const bodyValidation = rejectCompanySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        const errors = bodyValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.rejectCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        adminId: req.userId!,
        reason: bodyValidation.data.reason,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Từ chối công ty thành công' });
    } catch (error) {
      next(error);
    }
  };

  lockCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AuthorizationError('Chỉ quản trị viên mới có thể khóa công ty');
      }

      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.lockCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        adminId: req.userId!,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Khóa công ty thành công' });
    } catch (error) {
      next(error);
    }
  };

  unlockCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AuthorizationError('Chỉ quản trị viên mới có thể mở khóa công ty');
      }

      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.unlockCompanyUseCase.execute({
        companyId: paramValidation.data.id,
        adminId: req.userId!,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Mở khóa công ty thành công' });
    } catch (error) {
      next(error);
    }
  };

  uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      if (!req.file) {
        throw new ValidationError('Không có file được tải lên');
      }

      const result = await this.uploadLogoUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
        file: { buffer: req.file.buffer, originalname: req.file.originalname, mimetype: req.file.mimetype },
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Tải lên logo thành công' });
    } catch (error) {
      next(error);
    }
  };

  uploadBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      if (!req.file) {
        throw new ValidationError('Không có file được tải lên');
      }

      const result = await this.uploadBannerUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
        file: { buffer: req.file.buffer, originalname: req.file.originalname, mimetype: req.file.mimetype },
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Tải lên banner thành công' });
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.listMembersUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const bodyValidation = inviteMemberSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        const errors = bodyValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.inviteMemberUseCase.execute({
        companyId: paramValidation.data.id,
        inviterId: req.userId!,
        inviterRole: req.user!.role,
        email: bodyValidation.data.email,
        role: bodyValidation.data.role,
      });

      res.status(HttpStatus.CREATED).json({ success: true, data: result, message: 'Gửi lời mời thành công' });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = memberIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const bodyValidation = updateMemberRoleSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        const errors = bodyValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.updateMemberRoleUseCase.execute({
        companyId: paramValidation.data.id,
        memberId: paramValidation.data.memberId,
        userId: req.userId!,
        userRole: req.user!.role,
        newRole: bodyValidation.data.role,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Cập nhật vai trò thành viên thành công' });
    } catch (error) {
      next(error);
    }
  };

  deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = memberIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.deleteMemberUseCase.execute({
        companyId: paramValidation.data.id,
        memberId: paramValidation.data.memberId,
        userId: req.userId!,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  listInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const queryValidation = listInvitationsQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        const errors = queryValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.listInvitationsUseCase.execute({
        companyId: paramValidation.data.id,
        userId: req.userId!,
        userRole: req.user!.role,
        status: queryValidation.data.status,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  cancelInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = companyInvitationIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.cancelInvitationUseCase.execute({
        companyId: paramValidation.data.id,
        invitationId: paramValidation.data.invitationId,
        userId: req.userId!,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = invitationIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.acceptInvitationUseCase.execute({
        invitationId: paramValidation.data.invitationId,
        userId: req.userId!,
      });

      res.status(HttpStatus.OK).json({ success: true, data: result, message: 'Chấp nhận lời mời thành công' });
    } catch (error) {
      next(error);
    }
  };

  rejectInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = invitationIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        const errors = paramValidation.error.issues.map((e) => e.message);
        throw new ValidationError(errors[0] || 'Xác thực thất bại', errors);
      }

      const result = await this.rejectInvitationUseCase.execute({
        invitationId: paramValidation.data.invitationId,
        userId: req.userId!,
      });

      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}
