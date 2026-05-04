import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IStorageService } from '@shared/domain/services/IStorageService.js';
import { NotFoundError, ConflictError, AuthorizationError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UpdateCompanyInputDTO, UpdateCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  storageService: IStorageService;
}

export class UpdateCompanyUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly storageService: IStorageService;

  constructor({ companyRepository, companyMemberRepository, storageService }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.storageService = storageService;
  }

  async execute(input: UpdateCompanyInputDTO): Promise<UpdateCompanyOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check user permission (must be OWNER or MANAGER)
    const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
    if (!member) {
      throw new AuthorizationError('You are not a member of this company');
    }

    if (member.companyRole !== CompanyRole.OWNER && member.companyRole !== CompanyRole.MANAGER) {
      throw new AuthorizationError('Only owners and managers can update company information');
    }

    // Check if new name already exists (excluding current company)
    if (input.name && input.name !== company.name) {
      const nameExists = await this.companyRepository.nameExists(input.name, input.companyId);
      if (nameExists) {
        throw new ConflictError('Company name already exists');
      }
    }

    // Upload new logo if provided
    let logoUrl = company.logoUrl;
    const oldLogoUrl = company.logoUrl;
    if (input.logoFile) {
      logoUrl = await this.storageService.uploadImage(
        input.logoFile.buffer,
        input.logoFile.originalname,
        input.logoFile.mimetype,
        'company-logos'
      );
    }

    // Upload new banner if provided
    let bannerUrl = company.bannerUrl;
    const oldBannerUrl = company.bannerUrl;
    if (input.bannerFile) {
      bannerUrl = await this.storageService.uploadImage(
        input.bannerFile.buffer,
        input.bannerFile.originalname,
        input.bannerFile.mimetype,
        'company-banners'
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.website !== undefined) updateData.website = input.website;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.industry !== undefined) updateData.industry = input.industry;
    if (input.companySize !== undefined) updateData.companySize = input.companySize;
    if (input.foundedYear !== undefined) updateData.foundedYear = input.foundedYear;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email;
    if (logoUrl !== company.logoUrl) updateData.logoUrl = logoUrl;
    if (bannerUrl !== company.bannerUrl) updateData.bannerUrl = bannerUrl;

    // Update company
    await this.companyRepository.update(input.companyId, updateData as any);

    // Delete old files in background (don't wait)
    if (oldLogoUrl && logoUrl !== oldLogoUrl) {
      this.storageService.deleteFile(oldLogoUrl).catch(() => {
        // Log error but don't fail
      });
    }
    if (oldBannerUrl && bannerUrl !== oldBannerUrl) {
      this.storageService.deleteFile(oldBannerUrl).catch(() => {
        // Log error but don't fail
      });
    }

    // Fetch updated company
    const updatedCompany = await this.companyRepository.findByIdWithMembers(input.companyId);

    return this.mapToOutput(updatedCompany!);
  }

  private mapToOutput(company: any): UpdateCompanyOutputDTO {
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
