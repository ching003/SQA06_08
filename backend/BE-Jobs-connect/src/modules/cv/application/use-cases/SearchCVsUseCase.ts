import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { SearchCVsInputDTO, SearchCVsOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class SearchCVsUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: SearchCVsInputDTO): Promise<SearchCVsOutputDTO> {
    // Only admin and recruiter can search CVs
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isAdmin && !isRecruiter) {
      throw new AuthorizationError('Chỉ quản trị viên và nhà tuyển dụng mới có thể tìm kiếm CV');
    }

    const page = input.page || 1;
    const limit = input.limit || 10;

    const result = await this.cvRepository.searchCVs({
      search: input.search,
      skills: input.skills,
      location: input.location,
      educationLevel: input.educationLevel,
      page,
      limit,
    });

    return {
      data: result.data.map(mapCVToOutput),
      pagination: result.pagination,
    };
  }
}
