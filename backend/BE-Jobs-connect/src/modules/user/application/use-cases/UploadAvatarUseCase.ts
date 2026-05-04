import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IFileStorageService, UploadedFile } from '@shared/domain/services/IFileStorageService.js';
import { NotFoundError, ValidationError } from '@shared/domain/errors/index.js';
import type { UploadAvatarInputDTO, UploadAvatarOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
  fileStorageService: IFileStorageService;
}

export class UploadAvatarUseCase {
  private static readonly MAX_FILE_SIZE_MB = 5;
  private readonly userRepository: IUserRepository;
  private readonly fileStorageService: IFileStorageService;

  constructor({ userRepository, fileStorageService }: Dependencies) {
    this.userRepository = userRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(input: UploadAvatarInputDTO): Promise<UploadAvatarOutputDTO> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create UploadedFile object with size
    const uploadedFile: UploadedFile = {
      buffer: input.file.buffer,
      originalname: input.file.originalname,
      mimetype: input.file.mimetype,
      size: input.file.buffer.length,
    };

    // Validate file
    const validation = this.fileStorageService.validateImageFile(
      uploadedFile,
      UploadAvatarUseCase.MAX_FILE_SIZE_MB
    );
    if (!validation.isValid) {
      throw new ValidationError(validation.error || 'Invalid file');
    }

    // Upload new avatar (using userId as filename to ensure one avatar per user)
    const avatarUrl = await this.fileStorageService.uploadFile(
      uploadedFile,
      'avatars',
      input.id
    );

    // Delete old avatar if exists and different from new one
    if (user.avatarUrl && user.avatarUrl !== avatarUrl) {
      try {
        await this.fileStorageService.deleteFile(user.avatarUrl);
      } catch {
        // Ignore deletion errors for old avatar
      }
    }

    // Update user avatar URL
    await this.userRepository.update(input.id, { avatarUrl });

    return { avatarUrl };
  }
}
