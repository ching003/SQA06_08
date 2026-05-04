import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetAllCVsInputDTO, GetAllCVsOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class GetAllCVsUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: GetAllCVsInputDTO): Promise<GetAllCVsOutputDTO> {
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;
    const isCandidate = input.userRole === UserRole.CANDIDATE;

    // If candidate, they can only view their own CVs (all CVs, regardless of isOpenForJob)
    // Recruiter can only view CVs with isOpenForJob = true
    // Admin can view all CVs (or filter by userId/isOpenForJob if provided)
    let targetUserId: string | undefined;
    let isOpenForJobFilter: boolean | undefined;
    
    if (isCandidate) {
      if (!input.userId) {
        throw new AuthorizationError('Yêu cầu ID người dùng cho ứng viên');
      }
      targetUserId = input.userId; // Candidate can only see their own CVs
      // Candidate sees all their CVs, not filtered by isOpenForJob
    } else if (isRecruiter) {
      // Recruiter can only view CVs that are open for job
      isOpenForJobFilter = true;
      targetUserId = input.userId; // Can filter by userId if provided
    } else if (isAdmin) {
      // Admin can view all CVs, or filter by userId/isOpenForJob if provided
      targetUserId = input.userId;
      isOpenForJobFilter = input.isOpenForJob; // Use provided filter or undefined (all)
    } else {
      throw new AuthorizationError('Vai trò người dùng không hợp lệ');
    }

    const page = input.page || 1;
    const limit = input.limit || 10;

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (input.orderBy) {
      orderBy[input.orderBy] = input.orderDirection || 'desc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const result = await this.cvRepository.findAll({
      page,
      limit,
      userId: targetUserId,
      isOpenForJob: isOpenForJobFilter,
      orderBy,
    });

    return {
      data: result.data.map(mapCVToOutput),
      pagination: result.pagination,
    };
  }
}
