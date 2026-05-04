import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { UpdateTemplateInputDTO, UpdateTemplateOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
}

export class UpdateTemplateUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;

  constructor({ cvTemplateRepository, fileStorageService }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(input: UpdateTemplateInputDTO): Promise<UpdateTemplateOutputDTO> {
    // Only admins can update templates
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Chỉ quản trị viên mới có thể cập nhật mẫu CV');
    }

    // Find existing template
    const existingTemplate = await this.cvTemplateRepository.findById(input.templateId);
    if (!existingTemplate) {
      throw new NotFoundError('Không tìm thấy mẫu CV');
    }

    // Check if name already exists (if changing name)
    if (input.name && input.name !== existingTemplate.name) {
      const nameExists = await this.cvTemplateRepository.nameExists(input.name, input.templateId);
      if (nameExists) {
        throw new ConflictError('Tên mẫu CV đã tồn tại');
      }
    }

    let htmlUrl = input.htmlUrl;
    let previewUrl = input.previewUrl;
    let uploadedHtmlUrl: string | null = null;
    let uploadedPreviewUrl: string | null = null;
    const oldHtmlUrl = existingTemplate.htmlUrl;
    const oldPreviewUrl = existingTemplate.previewUrl;

    try {
      // Upload template file if provided
      if (input.templateFile) {
        const validation = this.fileStorageService.validateHtmlFile(input.templateFile);
        if (!validation.isValid) {
          throw new ValidationError(validation.error || 'File mẫu không hợp lệ');
        }
        uploadedHtmlUrl = await this.fileStorageService.uploadFile(
          input.templateFile,
          'cv-templates'
        );
        htmlUrl = uploadedHtmlUrl;
      }

      // Upload preview file if provided
      if (input.previewFile) {
        const validation = this.fileStorageService.validateImageFile(input.previewFile);
        if (!validation.isValid) {
          throw new ValidationError(validation.error || 'File xem trước không hợp lệ');
        }
        uploadedPreviewUrl = await this.fileStorageService.uploadFile(
          input.previewFile,
          'cv-template-previews'
        );
        previewUrl = uploadedPreviewUrl;
      }

      // Build update data
      const updateData: Partial<any> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (htmlUrl !== undefined) updateData.htmlUrl = htmlUrl;
      if (previewUrl !== undefined) updateData.previewUrl = previewUrl;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      const updated = await this.cvTemplateRepository.update(input.templateId, updateData);

      // Delete old files if new ones were uploaded
      if (uploadedHtmlUrl && oldHtmlUrl) {
        await this.fileStorageService.deleteFile(oldHtmlUrl).catch((err) => {
          console.error('Failed to delete old template file:', err);
        });
      }
      if (uploadedPreviewUrl && oldPreviewUrl) {
        await this.fileStorageService.deleteFile(oldPreviewUrl).catch((err) => {
          console.error('Failed to delete old preview file:', err);
        });
      }

      return {
        id: updated.id!,
        name: updated.name,
        htmlUrl: updated.htmlUrl,
        previewUrl: updated.previewUrl,
        isActive: updated.isActive,
        createdAt: updated.createdAt!,
        updatedAt: updated.updatedAt!,
      };
    } catch (error) {
      // Rollback: delete uploaded files if update fails
      if (uploadedHtmlUrl) {
        await this.fileStorageService.deleteFile(uploadedHtmlUrl).catch((err) => {
          console.error('Failed to rollback template file upload:', err);
        });
      }
      if (uploadedPreviewUrl) {
        await this.fileStorageService.deleteFile(uploadedPreviewUrl).catch((err) => {
          console.error('Failed to rollback preview file upload:', err);
        });
      }
      throw error;
    }
  }
}
