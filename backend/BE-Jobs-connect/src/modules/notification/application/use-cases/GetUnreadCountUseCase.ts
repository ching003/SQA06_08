import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { GetUnreadCountInputDTO, GetUnreadCountOutputDTO } from '../dtos/NotificationDTO.js';

interface Dependencies {
  notificationRepository: INotificationRepository;
}

export class GetUnreadCountUseCase {
  private readonly notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: Dependencies) {
    this.notificationRepository = notificationRepository;
  }

  async execute(input: GetUnreadCountInputDTO): Promise<GetUnreadCountOutputDTO> {
    const unreadCount = await this.notificationRepository.countUnreadByUserId(input.userId);
    return { unreadCount };
  }
}
