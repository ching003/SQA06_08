import { z } from 'zod';
import { ApplicationStatus } from '../../domain/enums/index.js';

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.nativeEnum(ApplicationStatus).optional(),
});

// Apply job schema
export const applyJobSchema = z.object({
  jobId: z.string().uuid({ message: 'Invalid job ID' }),
  cvId: z.string().uuid({ message: 'Invalid CV ID' }),
  coverLetter: z.string().max(5000).optional(),
});

// Update application status schema
export const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    message: 'Invalid status',
  }),
  notes: z.string().max(2000).optional(),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
