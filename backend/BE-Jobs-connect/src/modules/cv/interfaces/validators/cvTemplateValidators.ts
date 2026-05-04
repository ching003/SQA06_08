import { z } from 'zod';

// Create Template schema
// htmlUrl is optional IF template file is provided via multipart/form-data
export const createTemplateSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required' }).max(100),
  htmlUrl: z.string().url({ message: 'Invalid HTML URL' }).max(500).optional(),
  previewUrl: z.string().url({ message: 'Invalid preview URL' }).max(500).optional().or(z.literal('')),
  isActive: z.coerce.boolean().optional(),
});

// Update Template schema
export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  htmlUrl: z.string().url({ message: 'Invalid HTML URL' }).max(500).optional(),
  previewUrl: z.string().url({ message: 'Invalid preview URL' }).max(500).optional().nullable().or(z.literal('')),
  isActive: z.coerce.boolean().optional(),
});

// Template Pagination query schema
export const templatePaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  isActive: z.coerce.boolean().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplatePaginationInput = z.infer<typeof templatePaginationSchema>;
