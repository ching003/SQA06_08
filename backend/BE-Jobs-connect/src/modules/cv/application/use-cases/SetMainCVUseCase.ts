import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { SetMainCVInputDTO, SetMainCVOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class SetMainCVUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: SetMainCVInputDTO): Promise<SetMainCVOutputDTO> {
    // Find existing CV
    const existingCV = await this.cvRepository.findById(input.cvId);
    if (!existingCV) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission
    const isOwner = input.userId === (existingCV as any).userId;
    const isAdmin = input.userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError('Bạn không có quyền cập nhật CV này');
    }

    // Unset other main CVs for this user
    await this.cvRepository.unsetMainForUser((existingCV as any).userId);

    // Set this CV as main
    await this.cvRepository.update(input.cvId, { isMain: true });

    // Fetch updated CV with relations
    const updatedCV = await this.cvRepository.findByIdWithRelations(input.cvId);

    return mapCVToOutput(updatedCV!);
  }
}
