import type { ISavedCVRepository } from '../../domain/repositories/ISavedCVRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { UnsaveCVInputDTO, UnsaveCVOutputDTO } from '../dtos/index.js';

interface Dependencies {
  savedCVRepository: ISavedCVRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class UnsaveCVUseCase {
  private readonly savedCVRepository: ISavedCVRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ savedCVRepository, companyMemberRepository }: Dependencies) {
    this.savedCVRepository = savedCVRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: UnsaveCVInputDTO): Promise<UnsaveCVOutputDTO> {
    // Check permission
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isAdmin && !isRecruiter) {
      const companyMember = await this.companyMemberRepository.findByUserId(input.userId);
      if (!companyMember) {
        throw new AuthorizationError('Chỉ nhà tuyển dụng mới có thể bỏ lưu CV');
      }
    }

    // Check if saved
    const savedCV = await this.savedCVRepository.findByUserAndCV(input.userId, input.cvId);
    if (!savedCV) {
      throw new NotFoundError('CV chưa được lưu');
    }

    await this.savedCVRepository.deleteByUserAndCV(input.userId, input.cvId);

    return {
      success: true,
      message: 'Bỏ lưu CV thành công',
    };
  }
}
