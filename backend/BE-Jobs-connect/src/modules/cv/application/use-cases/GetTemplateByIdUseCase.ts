import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetTemplateByIdInputDTO, GetTemplateByIdOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
}

export class GetTemplateByIdUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;

  constructor({ cvTemplateRepository }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
  }

  async execute(input: GetTemplateByIdInputDTO): Promise<GetTemplateByIdOutputDTO> {
    const template = await this.cvTemplateRepository.findById(input.templateId);
    if (!template) {
      throw new NotFoundError('Không tìm thấy mẫu CV');
    }

    // Non-admin can only see active templates
    const isAdmin = input.userRole === UserRole.ADMIN;
    if (!isAdmin && !template.isActive) {
      throw new AuthorizationError('Mẫu CV không khả dụng');
    }

    return {
      id: template.id!,
      name: template.name,
      htmlUrl: template.htmlUrl,
      previewUrl: template.previewUrl,
      isActive: template.isActive,
      createdAt: template.createdAt!,
      updatedAt: template.updatedAt!,
    };
  }
}
