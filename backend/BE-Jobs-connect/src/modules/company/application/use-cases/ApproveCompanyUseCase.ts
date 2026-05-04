import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, BusinessRuleError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { ApproveCompanyInputDTO, ApproveCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  notificationService: INotificationService;
}

export class ApproveCompanyUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly userRepository: IUserRepository;
  private readonly notificationService: INotificationService;

  constructor({ companyRepository, companyMemberRepository, userRepository, notificationService }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async execute(input: ApproveCompanyInputDTO): Promise<ApproveCompanyOutputDTO> {
    // Check admin permission
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Chỉ quản trị viên mới có thể phê duyệt công ty');
    }

    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy công ty');
    }

    // Find company owner
    const owners = await this.companyMemberRepository.findByRole(input.companyId, CompanyRole.OWNER);
    if (owners.length === 0) {
      throw new BusinessRuleError('Công ty không có chủ sở hữu');
    }
    const owner = owners[0];

    // Atomically update company status from PENDING to ACTIVE
    // This prevents race conditions when multiple admins approve simultaneously
    const updatedCompany = await this.companyRepository.updateStatus(
      input.companyId,
      UserStatus.ACTIVE,
      UserStatus.PENDING
    );

    // If update failed, the company is not in PENDING status
    if (!updatedCompany) {
      throw new BusinessRuleError('Công ty đã được phê duyệt');
    }

    // Update owner's user role to RECRUITER if not already
    const ownerUser = await this.userRepository.findById(owner.userId);
    if (ownerUser && ownerUser.role !== UserRole.RECRUITER && ownerUser.role !== UserRole.ADMIN) {
      await this.userRepository.update(owner.userId, { role: UserRole.RECRUITER });
    }

    // Notify company owner
    await this.notificationService.createNotification({
      userId: owner.userId,
      type: 'COMPANY_APPROVED',
      title: 'Công ty đã được phê duyệt',
      message: `Công ty "${company.name}" của bạn đã được phê duyệt!`,
      data: { companyId: company.id },
    });

    // Fetch updated company with members
    const companyWithMembers = await this.companyRepository.findByIdWithMembers(input.companyId);

    return this.mapToOutput(companyWithMembers!);
  }

  private mapToOutput(company: any): ApproveCompanyOutputDTO {
    return {
      id: company.id,
      name: company.name,
      website: company.website,
      description: company.description,
      industry: company.industry,
      companySize: company.companySize,
      foundedYear: company.foundedYear,
      address: company.address,
      phone: company.phone,
      email: company.email,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      status: company.status,
      documentUrl: company.documentUrl,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      members: company.members?.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        companyId: m.companyId,
        companyRole: m.companyRole,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        user: m.user
          ? {
            id: m.user.id,
            email: m.user.email,
            fullName: m.user.fullName,
            avatarUrl: m.user.avatarUrl,
            status: m.user.status,
          }
          : undefined,
      })),
    };
  }
}
