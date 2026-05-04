import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IStorageService } from '@shared/domain/services/IStorageService.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UploadLogoInputDTO, UploadLogoOutputDTO } from '../dtos/index.js';

export class UploadLogoUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(input: UploadLogoInputDTO): Promise<UploadLogoOutputDTO> {
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
      throw new AuthorizationError('You do not have permission to upload company logo');
    }

    // Upload new logo
    const logoUrl = await this.storageService.uploadImage(
      input.file.buffer,
      input.file.originalname,
      input.file.mimetype,
      'company-logos'
    );

    // Store old logo URL for deletion
    const oldLogoUrl = company.logoUrl;

    // Update company logo
    await this.companyRepository.update(input.companyId, { logoUrl } as any);

    // Delete old logo in background
    if (oldLogoUrl) {
      this.storageService.deleteFile(oldLogoUrl).catch(() => {
        // Log error but don't fail
      });
    }

    return { logoUrl };
  }
}
