import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { GetActiveTemplatesInputDTO, GetActiveTemplatesOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
}

export class GetActiveTemplatesUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;

  constructor({ cvTemplateRepository }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
  }

  async execute(input: GetActiveTemplatesInputDTO): Promise<GetActiveTemplatesOutputDTO> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    const result = await this.cvTemplateRepository.findActive({
      page,
      limit,
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
