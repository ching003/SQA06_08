import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetCVsByUserInputDTO, GetCVsByUserOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  userRepository: IUserRepository;
}

export class GetCVsByUserUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly userRepository: IUserRepository;

  constructor({ cvRepository, userRepository }: Dependencies) {
    this.cvRepository = cvRepository;
    this.userRepository = userRepository;
  }

  async execute(input: GetCVsByUserInputDTO): Promise<GetCVsByUserOutputDTO> {
    // Check if target user exists
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Check permission
    const isOwner = input.userId === input.targetUserId;
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;

    if (!isOwner && !isAdmin && !isRecruiter) {
      throw new AuthorizationError('Bạn không có quyền xem các CV này');
    }

    const cvs = await this.cvRepository.findByUserId(input.targetUserId);

    return {
      cvs: cvs.map(mapCVToOutput),
    };
  }
}
