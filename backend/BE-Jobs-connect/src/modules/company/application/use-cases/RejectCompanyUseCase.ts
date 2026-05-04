import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, BusinessRuleError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { RejectCompanyInputDTO, RejectCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  notificationService: INotificationService;
}

export class RejectCompanyUseCase {
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

  async execute(input: RejectCompanyInputDTO): Promise<RejectCompanyOutputDTO> {
    // Check admin permission
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admins can reject companies');
    }

    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check if company is already active
    if (company.status === UserStatus.ACTIVE) {
      throw new BusinessRuleError('Cannot reject an already approved company');
    }

    // Find company owner
    const owners = await this.companyMemberRepository.findByRole(input.companyId, CompanyRole.OWNER);
    if (owners.length === 0) {
      throw new BusinessRuleError('Company has no owner');
    }
    const owner = owners[0];

    // Update company status to SUSPENDED
    await this.companyRepository.update(input.companyId, {
      status: UserStatus.SUSPENDED,
    } as any);

    // Notify company owner about rejection
    const reason = input.reason || 'Không có lý do cụ thể';
    await this.notificationService.createNotification({
      userId: owner.userId,
      type: 'COMPANY_REJECTED',
      title: 'Đăng ký công ty bị từ chối',
      message: `Đăng ký công ty "${company.name}" đã bị từ chối. Lý do: ${reason}`,
      data: { companyId: company.id, reason },
    });

    // Fetch updated company with members
    const companyWithMembers = await this.companyRepository.findByIdWithMembers(input.companyId);

    return this.mapToOutput(companyWithMembers!);
  }

  private mapToOutput(company: any): RejectCompanyOutputDTO {
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
