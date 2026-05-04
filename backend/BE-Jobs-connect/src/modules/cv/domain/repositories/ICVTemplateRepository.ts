import type { CVTemplate } from '../entities/CVTemplate.js';

export interface FindAllTemplatesOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ICVTemplateRepository {
  findById(id: string): Promise<CVTemplate | null>;
  findAll(options: FindAllTemplatesOptions): Promise<PaginatedResult<CVTemplate>>;
  findActive(options?: FindAllTemplatesOptions): Promise<PaginatedResult<CVTemplate>>;
  save(template: CVTemplate): Promise<CVTemplate>;
  update(id: string, data: Partial<CVTemplate>): Promise<CVTemplate>;
  delete(id: string): Promise<CVTemplate>;
  nameExists(name: string, excludeId?: string): Promise<boolean>;
  hasAssociatedCVs(templateId: string): Promise<boolean>;
}
