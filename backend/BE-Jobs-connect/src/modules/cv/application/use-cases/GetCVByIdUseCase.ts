import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetCVByIdInputDTO, GetCVByIdOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class GetCVByIdUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: GetCVByIdInputDTO): Promise<GetCVByIdOutputDTO> {
    const cv = await this.cvRepository.findByIdWithRelations(input.cvId);
    if (!cv) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission
    const isOwner = input.userId === (cv as any).userId;
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    // Owner and Admin can always view
    if (isOwner || isAdmin) {
      return mapCVToOutput(cv);
    }

    // Recruiter can ONLY view CVs that are open for job (public CVs)
    if (isRecruiter) {
      if (!(cv as any).isOpenForJob) {
        throw new AuthorizationError('CV này không công khai');
      }
      return mapCVToOutput(cv);
    }

    // Candidate cannot view other people's CVs
    throw new AuthorizationError('Bạn không có quyền xem CV này');
  }
}
