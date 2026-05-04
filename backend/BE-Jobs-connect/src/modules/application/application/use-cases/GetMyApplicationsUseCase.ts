import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { GetMyApplicationsInputDTO, GetMyApplicationsOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
}

export class GetMyApplicationsUseCase {
  private readonly applicationRepository: IApplicationRepository;

  constructor({ applicationRepository }: Dependencies) {
    this.applicationRepository = applicationRepository;
  }

  async execute(input: GetMyApplicationsInputDTO): Promise<GetMyApplicationsOutputDTO> {
    const { userId, userRole, page = 1, limit = 20, status } = input;

    // Only CANDIDATE can view their own applications
    if (userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Only candidates can view their applications');
    }

    const result = await this.applicationRepository.findByUserId(userId, {
      page,
      limit,
      status,
      includeRelations: true,
    });

    return {
      data: result.data.map(mapApplicationToOutput),
      pagination: result.pagination,
    };
  }
}
