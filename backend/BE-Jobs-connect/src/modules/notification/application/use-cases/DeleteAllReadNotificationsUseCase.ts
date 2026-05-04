import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { DeleteAllReadInputDTO, DeleteAllReadOutputDTO } from '../dtos/NotificationDTO.js';

interface Dependencies {
  notificationRepository: INotificationRepository;
}

export class DeleteAllReadNotificationsUseCase {
  private readonly notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: Dependencies) {
    this.notificationRepository = notificationRepository;
  }

  async execute(input: DeleteAllReadInputDTO): Promise<DeleteAllReadOutputDTO> {
    const deletedCount = await this.notificationRepository.deleteAllRead(input.userId);
    return { deletedCount };
  }
}
