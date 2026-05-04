import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';

interface Dependencies {
    userRepository: IUserRepository;
}

export class LogoutUserUseCase {
    private readonly userRepository: IUserRepository;

    constructor({ userRepository }: Dependencies) {
        this.userRepository = userRepository;
    }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Update lastLogoutAt to current time
        const updatedUser = user.with({
            lastLogoutAt: new Date(),
        });

        await this.userRepository.update(user.id, {
            lastLogoutAt: updatedUser.lastLogoutAt,
        });
    }
}
