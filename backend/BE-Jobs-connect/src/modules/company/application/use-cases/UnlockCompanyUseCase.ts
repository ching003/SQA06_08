import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import { NotFoundError, BusinessRuleError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { JobStatus } from '@modules/job/domain/enums/JobStatus.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { UnlockCompanyInputDTO, UnlockCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  jobRepository: IJobRepository;
  notificationService: INotificationService;
}

export class UnlockCompanyUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly userRepository: IUserRepository;
  private readonly jobRepository: IJobRepository;
  private readonly notificationService: INotificationService;

  constructor({
    companyRepository,
    companyMemberRepository,
    userRepository,
    jobRepository,
    notificationService,
  }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.userRepository = userRepository;
    this.jobRepository = jobRepository;
    this.notificationService = notificationService;
  }

  async execute(input: UnlockCompanyInputDTO): Promise<UnlockCompanyOutputDTO> {
    // Check admin permission
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admins can unlock companies');
    }

    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check if company is already unlocked (not locked)
    if (company.status !== UserStatus.LOCKED) {
      throw new BusinessRuleError('Company is not locked');
    }

    // Find company owner
    const owners = await this.companyMemberRepository.findByRole(input.companyId, CompanyRole.OWNER);
    if (owners.length === 0) {
      throw new BusinessRuleError('Company has no owner');
    }
    const owner = owners[0];

    // Update company status to ACTIVE (unlock means restore to active)
    await this.companyRepository.update(input.companyId, {
      status: UserStatus.ACTIVE,
    } as any);

    // Unlock all LOCKED jobs of the company (restore to ACTIVE)
    let page = 1;
    const limit = 100; // Process in batches
    let hasMore = true;

    while (hasMore) {
      const jobsResult = await this.jobRepository.findByCompanyId(input.companyId, {
        page,
        limit,
        status: JobStatus.LOCKED,
      });

      // Unlock each locked job (restore to ACTIVE)
      for (const job of jobsResult.data) {
        await this.jobRepository.update(job.id!, {
          status: JobStatus.ACTIVE,
        });
      }

      hasMore = jobsResult.pagination.total > page * limit;
      page++;
    }

    // Notify company owner
    await this.notificationService.createNotification({
      userId: owner.userId,
      type: 'COMPANY_APPROVED', // Using existing notification type
      title: 'Công ty đã được mở khóa',
      message: `Công ty "${company.name}" của bạn đã được mở khóa bởi quản trị viên.`,
      data: { companyId: company.id },
    });

    // Fetch updated company with members
    const companyWithMembers = await this.companyRepository.findByIdWithMembers(input.companyId);

    return this.mapToOutput(companyWithMembers!);
  }

  private mapToOutput(company: any): UnlockCompanyOutputDTO {
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

