import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { ISavedCVRepository } from '../../domain/repositories/ISavedCVRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { SaveCVInputDTO, SaveCVOutputDTO } from '../dtos/index.js';
import { SavedCV } from '../../domain/entities/SavedCV.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  savedCVRepository: ISavedCVRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class SaveCVUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly savedCVRepository: ISavedCVRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ cvRepository, savedCVRepository, companyMemberRepository }: Dependencies) {
    this.cvRepository = cvRepository;
    this.savedCVRepository = savedCVRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: SaveCVInputDTO): Promise<SaveCVOutputDTO> {
    // Check permission - only recruiters can save CVs
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isAdmin && !isRecruiter) {
      // Check if user is a company member (recruiter)
      const companyMember = await this.companyMemberRepository.findByUserId(input.userId);
      if (!companyMember) {
        throw new AuthorizationError('Chỉ nhà tuyển dụng mới có thể lưu CV');
      }
    }

    // Find CV
    const cv = await this.cvRepository.findByIdWithRelations(input.cvId);
    if (!cv) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Cannot save own CV
    if ((cv as any).userId === input.userId) {
      throw new ValidationError('Bạn không thể lưu CV của chính mình');
    }

    // Check if already saved
    const existingSaved = await this.savedCVRepository.findByUserAndCV(input.userId, input.cvId);
    if (existingSaved) {
      throw new ConflictError('CV đã được lưu');
    }

    // Save CV
    const savedCV = new SavedCV({
      userId: input.userId,
      cvId: input.cvId,
      notes: input.notes || null,
    });

    const saved = await this.savedCVRepository.save(savedCV);

    return {
      id: saved.id!,
      userId: saved.userId,
      cvId: saved.cvId,
      notes: saved.notes || null,
      createdAt: saved.createdAt!,
      cv: mapCVToOutput(cv),
    };
  }
}
