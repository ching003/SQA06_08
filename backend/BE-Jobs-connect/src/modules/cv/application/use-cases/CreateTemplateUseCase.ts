import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import { AuthorizationError, ConflictError, ValidationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { CVTemplate } from '../../domain/entities/CVTemplate.js';
import type { CreateTemplateInputDTO, CreateTemplateOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
}

export class CreateTemplateUseCase {
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;

  constructor({ cvTemplateRepository, fileStorageService }: Dependencies) {
    this.cvTemplateRepository = cvTemplateRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(input: CreateTemplateInputDTO): Promise<CreateTemplateOutputDTO> {
    // Only admins can create templates
    if (input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Only admins can create templates');
    }

    // Validate: either htmlUrl or templateFile must be provided
    if (!input.htmlUrl && !input.templateFile) {
      throw new ValidationError('Either HTML URL or template file is required');
    }

    // Check if name already exists
    const nameExists = await this.cvTemplateRepository.nameExists(input.name);
    if (nameExists) {
      throw new ConflictError('Template with this name already exists');
    }

    let htmlUrl = input.htmlUrl;
    let previewUrl = input.previewUrl;
    let uploadedHtmlUrl: string | null = null;
    let uploadedPreviewUrl: string | null = null;

    try {
      // Upload template file if provided
      if (input.templateFile) {
        const validation = this.fileStorageService.validateHtmlFile(input.templateFile);
        if (!validation.isValid) {
          throw new ValidationError(validation.error || 'Invalid template file');
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
          throw new ValidationError(validation.error || 'Invalid preview file');
        }
        uploadedPreviewUrl = await this.fileStorageService.uploadFile(
          input.previewFile,
          'cv-template-previews'
        );
        previewUrl = uploadedPreviewUrl;
      }

      const template = new CVTemplate({
        name: input.name,
        htmlUrl: htmlUrl!,
        previewUrl: previewUrl,
        isActive: input.isActive ?? true,
      });

      const created = await this.cvTemplateRepository.save(template);

      return {
        id: created.id!,
        name: created.name,
        htmlUrl: created.htmlUrl,
        previewUrl: created.previewUrl,
        isActive: created.isActive,
        createdAt: created.createdAt!,
        updatedAt: created.updatedAt!,
      };
    } catch (error) {
      // Rollback: delete uploaded files if creation fails
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
