import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import { NotFoundError, AuthorizationError, ConflictError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { DeleteTemplateInputDTO, DeleteTemplateOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
}

export class DeleteTemplateUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;

  constructor({ cvTemplateRepository, fileStorageService }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(input: DeleteTemplateInputDTO): Promise<DeleteTemplateOutputDTO> {
    // Only admins can delete templates
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Chỉ quản trị viên mới có thể xóa mẫu CV');
    }

    // Find existing template
    const existingTemplate = await this.cvTemplateRepository.findById(input.templateId);
    if (!existingTemplate) {
      throw new NotFoundError('Không tìm thấy mẫu CV');
    }

    // Check if template has associated CVs
    const hasAssociatedCVs = await this.cvTemplateRepository.hasAssociatedCVs(input.templateId);
    if (hasAssociatedCVs) {
      throw new ConflictError('Không thể xóa mẫu CV đang được sử dụng');
    }

    // Delete template files
    if (existingTemplate.htmlUrl) {
      await this.fileStorageService.deleteFile(existingTemplate.htmlUrl).catch((err) => {
        console.error('Failed to delete template file:', err);
      });
    }
    if (existingTemplate.previewUrl) {
      await this.fileStorageService.deleteFile(existingTemplate.previewUrl).catch((err) => {
        console.error('Failed to delete preview file:', err);
      });
    }

    await this.cvTemplateRepository.delete(input.templateId);

    return {
      success: true,
      message: 'Xóa mẫu CV thành công',
    };
  }
}
