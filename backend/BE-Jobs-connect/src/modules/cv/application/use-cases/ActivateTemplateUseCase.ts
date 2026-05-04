import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { ActivateTemplateInputDTO, ActivateTemplateOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
}

export class ActivateTemplateUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;

  constructor({ cvTemplateRepository }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
  }

  async execute(input: ActivateTemplateInputDTO): Promise<ActivateTemplateOutputDTO> {
    // Only admins can activate templates
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admins can activate templates');
    }

    // Find existing template
    const existingTemplate = await this.cvTemplateRepository.findById(input.templateId);
    if (!existingTemplate) {
      throw new NotFoundError('Template not found');
    }

    const updated = await this.cvTemplateRepository.update(input.templateId, { isActive: true });

    return {
      id: updated.id!,
      name: updated.name,
      htmlUrl: updated.htmlUrl,
      previewUrl: updated.previewUrl,
      isActive: updated.isActive,
      createdAt: updated.createdAt!,
      updatedAt: updated.updatedAt!,
    };
  }
}
