import type { ISavedCVRepository } from '../../domain/repositories/ISavedCVRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { UpdateSavedCVNotesInputDTO, UpdateSavedCVNotesOutputDTO } from '../dtos/index.js';

interface Dependencies {
  savedCVRepository: ISavedCVRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class UpdateSavedCVNotesUseCase {
  private readonly savedCVRepository: ISavedCVRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ savedCVRepository, companyMemberRepository }: Dependencies) {
    this.savedCVRepository = savedCVRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: UpdateSavedCVNotesInputDTO): Promise<UpdateSavedCVNotesOutputDTO> {
    // Check permission
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isAdmin && !isRecruiter) {
      const companyMember = await this.companyMemberRepository.findByUserId(input.userId);
      if (!companyMember) {
        throw new AuthorizationError('Chỉ nhà tuyển dụng mới có thể cập nhật ghi chú CV đã lưu');
      }
    }

    // Find saved CV
    const savedCV = await this.savedCVRepository.findByUserAndCV(input.userId, input.cvId);
    if (!savedCV) {
      throw new NotFoundError('Không tìm thấy CV đã lưu');
    }

    // Update notes
    const updated = await this.savedCVRepository.updateNotes(savedCV.id!, input.notes);

    return {
      id: updated.id!,
      notes: updated.notes ?? null,
      updatedAt: updated.updatedAt!,
    };
  }
}
