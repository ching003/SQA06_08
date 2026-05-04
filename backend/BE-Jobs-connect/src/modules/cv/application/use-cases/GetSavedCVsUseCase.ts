import type { ISavedCVRepository } from '../../domain/repositories/ISavedCVRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetSavedCVsInputDTO, GetSavedCVsOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  savedCVRepository: ISavedCVRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class GetSavedCVsUseCase {
  private readonly savedCVRepository: ISavedCVRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ savedCVRepository, companyMemberRepository }: Dependencies) {
    this.savedCVRepository = savedCVRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: GetSavedCVsInputDTO): Promise<GetSavedCVsOutputDTO> {
    // Check permission
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isAdmin && !isRecruiter) {
      const companyMember = await this.companyMemberRepository.findByUserId(input.userId);
      if (!companyMember) {
        throw new AuthorizationError('Chỉ nhà tuyển dụng mới có thể xem CV đã lưu');
      }
    }

    const page = input.page || 1;
    const limit = input.limit || 10;

    const result = await this.savedCVRepository.findByUserId(input.userId, {
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map((savedCV: any) => ({
        id: savedCV.id,
        userId: savedCV.userId,
        cvId: savedCV.cvId,
        notes: savedCV.notes,
        createdAt: savedCV.createdAt,
        updatedAt: savedCV.updatedAt,
        cv: savedCV.cv ? mapCVToOutput(savedCV.cv) : undefined,
      })),
      pagination: result.pagination,
    };
  }
}
