import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IStorageService } from '@shared/domain/services/IStorageService.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UploadBannerInputDTO, UploadBannerOutputDTO } from '../dtos/index.js';

export class UploadBannerUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(input: UploadBannerInputDTO): Promise<UploadBannerOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check user permission (must be OWNER, MANAGER, or RECRUITER)
    const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
    if (!member) {
      throw new AuthorizationError('You are not a member of this company');
    }

    const allowedRoles: CompanyRole[] = [CompanyRole.OWNER, CompanyRole.MANAGER, CompanyRole.RECRUITER];
    if (!allowedRoles.includes(member.companyRole)) {
      throw new AuthorizationError('You do not have permission to upload company banner');
    }

    // Upload new banner
    const bannerUrl = await this.storageService.uploadImage(
      input.file.buffer,
      input.file.originalname,
      input.file.mimetype,
      'company-banners'
    );

    // Store old banner URL for deletion
    const oldBannerUrl = company.bannerUrl;

    // Update company banner
    await this.companyRepository.update(input.companyId, { bannerUrl } as any);

    // Delete old banner in background
    if (oldBannerUrl) {
      this.storageService.deleteFile(oldBannerUrl).catch(() => {
        // Log error but don't fail
      });
    }

    return { bannerUrl };
  }
}
