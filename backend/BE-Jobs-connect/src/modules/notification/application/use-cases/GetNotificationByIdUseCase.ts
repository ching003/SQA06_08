import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { GetNotificationByIdInputDTO, GetNotificationByIdOutputDTO } from '../dtos/NotificationDTO.js';
import { mapNotificationToOutput } from '../helpers/index.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';

interface Dependencies {
  notificationRepository: INotificationRepository;
}

export class GetNotificationByIdUseCase {
  private readonly notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: Dependencies) {
    this.notificationRepository = notificationRepository;
  }

  async execute(input: GetNotificationByIdInputDTO): Promise<GetNotificationByIdOutputDTO> {
    const notification = await this.notificationRepository.findById(input.notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check if user owns the notification
    if (notification.userId !== input.userId) {
      throw new AuthorizationError('You do not have permission to access this notification');
    }

    return mapNotificationToOutput(notification);
  }
}
