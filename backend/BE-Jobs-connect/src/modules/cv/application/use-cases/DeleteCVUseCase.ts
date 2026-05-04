import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { NotFoundError, AuthorizationError, ConflictError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { DeleteCVInputDTO, DeleteCVOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class DeleteCVUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: DeleteCVInputDTO): Promise<DeleteCVOutputDTO> {
    // Find existing CV
    const existingCV = await this.cvRepository.findById(input.cvId);
    if (!existingCV) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission
    const isOwner = input.userId === (existingCV as any).userId;
    const isAdmin = input.userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError('Bạn không có quyền xóa CV này');
    }

    // Check if CV has applications
    const hasApplications = await this.cvRepository.hasApplications(input.cvId);
    if (hasApplications) {
      throw new ConflictError('Không thể xóa CV đã có đơn ứng tuyển');
    }

    // If deleting main CV, auto-promote another CV to main
    const wasMainCV = (existingCV as any).isMain;
    if (wasMainCV) {
      // Get all user's CVs except the one being deleted
      const userCVs = await this.cvRepository.findByUserId((existingCV as any).userId);
      const remainingCVs = userCVs.filter(cv => (cv as any).id !== input.cvId);

      // If user has other CVs, promote the oldest one to main
      if (remainingCVs.length > 0) {
        const oldestCV = remainingCVs.sort((a, b) => {
          const dateA = new Date((a as any).createdAt).getTime();
          const dateB = new Date((b as any).createdAt).getTime();
          return dateA - dateB;
        })[0];

        await this.cvRepository.update((oldestCV as any).id, {
          isMain: true
        } as any);
      }
    }

    await this.cvRepository.delete(input.cvId);

    return {
      success: true,
      message: 'Xóa CV thành công',
    };
  }
}
