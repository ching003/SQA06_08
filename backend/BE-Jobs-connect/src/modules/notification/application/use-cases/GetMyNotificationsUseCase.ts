import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { GetMyNotificationsInputDTO, GetMyNotificationsOutputDTO } from '../dtos/NotificationDTO.js';
import { mapNotificationToOutput } from '../helpers/index.js';

interface Dependencies {
  notificationRepository: INotificationRepository;
}

export class GetMyNotificationsUseCase {
  private readonly notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: Dependencies) {
    this.notificationRepository = notificationRepository;
  }

  async execute(input: GetMyNotificationsInputDTO): Promise<GetMyNotificationsOutputDTO> {
    const result = await this.notificationRepository.findByUserId(input.userId, {
      page: input.page || 1,
      limit: input.limit || 20,
      isRead: input.isRead,
      type: input.type as unknown as string,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map(mapNotificationToOutput),
      pagination: result.pagination,
    };
  }
}
