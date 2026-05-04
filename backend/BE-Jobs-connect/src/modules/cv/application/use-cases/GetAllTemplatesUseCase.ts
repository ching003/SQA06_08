import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetAllTemplatesInputDTO, GetAllTemplatesOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
}

export class GetAllTemplatesUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;

  constructor({ cvTemplateRepository }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
  }

  async execute(input: GetAllTemplatesInputDTO): Promise<GetAllTemplatesOutputDTO> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    // Non-admin users can only see active templates
    let isActiveFilter = input.isActive;
    if (input.userRole !== UserRole.ADMIN) {
      isActiveFilter = true; // Force active only for non-admin users
    }

    const result = await this.cvTemplateRepository.findAll({
      page,
      limit,
      isActive: isActiveFilter,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map((template: any) => ({
        id: template.id,
        name: template.name,
        htmlUrl: template.htmlUrl,
        previewUrl: template.previewUrl,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })),
      pagination: result.pagination,
    };
  }
}
