import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { IStorageService } from '@shared/domain/services/IStorageService.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { ConflictError, ValidationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { RegisterCompanyInputDTO, RegisterCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  storageService: IStorageService;
  notificationService: INotificationService;
}

export class RegisterCompanyUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly userRepository: IUserRepository;
  private readonly storageService: IStorageService;
  private readonly notificationService: INotificationService;

  constructor({ companyRepository, companyMemberRepository, userRepository, storageService, notificationService }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.userRepository = userRepository;
    this.storageService = storageService;
    this.notificationService = notificationService;
  }

  async execute(input: RegisterCompanyInputDTO): Promise<RegisterCompanyOutputDTO> {
    const ownerId = input.ownerId || input.userId!;

    // First, check if user is already a RECRUITER or ADMIN - they cannot register a company
    const user = await this.userRepository.findById(ownerId);
    if (!user) {
      throw new ValidationError('Người dùng không tồn tại');
    }

    if (user.role === UserRole.RECRUITER) {
      throw new ConflictError('Bạn đã là nhà tuyển dụng của một công ty. Mỗi người dùng chỉ có thể quản lý một công ty.');
    }

    if (user.role === UserRole.ADMIN) {
      throw new ConflictError('Tài khoản quản trị viên không thể đăng ký công ty.');
    }

    // Check if user has a pending company registration
    const existingMember = await this.companyMemberRepository.findByUserId(ownerId);
    if (existingMember) {
      // Get the company to check its status
      const company = await this.companyRepository.findById(existingMember.companyId);

      if (company && company.status === UserStatus.PENDING) {
        throw new ConflictError('Bạn đã có đơn đăng ký công ty đang chờ xét duyệt. Vui lòng chờ kết quả trước khi đăng ký công ty mới.');
      }

      // If company exists but is not PENDING, we allow new registration
      // This includes: INACTIVE/LOCKED/SUSPENDED (rejected) or ACTIVE with CANDIDATE role (edge case)
      // We need to delete the old membership first to avoid unique constraint violation
      if (company) {
        await this.companyMemberRepository.delete(existingMember.id!);
      }
    }

    // Check if company name already exists
    const nameExists = await this.companyRepository.nameExists(input.name);
    if (nameExists) {
      throw new ConflictError('Tên công ty đã tồn tại');
    }

    // Validate document file
    if (!input.documentFile) {
      throw new ValidationError('Tài liệu đăng ký công ty là bắt buộc');
    }

    // Upload document (required)
    const documentUrl = await this.storageService.uploadDocument(
      input.documentFile.buffer,
      input.documentFile.originalname,
      input.documentFile.mimetype
    );

    // Upload logo if provided
    let logoUrl: string | null = null;
    if (input.logoFile) {
      logoUrl = await this.storageService.uploadImage(
        input.logoFile.buffer,
        input.logoFile.originalname,
        input.logoFile.mimetype,
        'company-logos'
      );
    }

    // Create company with PENDING status
    const company = await this.companyRepository.save({
      name: input.name,
      website: input.website || null,
      description: input.description || null,
      industry: input.industry || null,
      companySize: input.companySize || null,
      foundedYear: input.foundedYear || null,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
      logoUrl,
      bannerUrl: null,
      status: UserStatus.PENDING,
      documentUrl,
    } as any);

    // Create company member with OWNER role
    await this.companyMemberRepository.save({
      userId: ownerId,
      companyId: company.id!,
      companyRole: CompanyRole.OWNER,
    } as any);

    // Notify all admins about new company registration
    const admins = await this.userRepository.findAll({
      role: UserRole.ADMIN,
      page: 1,
      limit: 100,
    });

    for (const admin of admins.data) {
      await this.notificationService.createNotification({
        userId: admin.id,
        type: 'COMPANY_REGISTRATION',
        title: 'Đăng ký công ty mới',
        message: `Công ty "${company.name}" đã đăng ký và đang chờ phê duyệt.`,
        data: { companyId: company.id },
      });
    }

    // Fetch company with members
    const companyWithMembers = await this.companyRepository.findByIdWithMembers(company.id!);

    return this.mapToOutput(companyWithMembers!);
  }

  private mapToOutput(company: any): RegisterCompanyOutputDTO {
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
