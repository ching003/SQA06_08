import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { MarkAllAsReadInputDTO, MarkAllAsReadOutputDTO } from '../dtos/NotificationDTO.js';

interface Dependencies {
  notificationRepository: INotificationRepository;
}

export class MarkAllAsReadUseCase {
  private readonly notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: Dependencies) {
    this.notificationRepository = notificationRepository;
  }

  async execute(input: MarkAllAsReadInputDTO): Promise<MarkAllAsReadOutputDTO> {
    await this.notificationRepository.markAllAsRead(input.userId);
    return { success: true };
  }
}
