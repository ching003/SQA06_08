import { z } from 'zod';
import { NotificationType } from '../../domain/enums/index.js';

// Pagination schema for notifications
export const notificationPaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  isRead: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  type: z.nativeEnum(NotificationType).optional(),
});

export type NotificationPaginationInput = z.infer<typeof notificationPaginationSchema>;
