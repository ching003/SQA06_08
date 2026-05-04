import type { Application } from '../entities/Application.js';

export interface FindApplicationsOptions {
  page?: number;
  limit?: number;
  status?: string;
  orderBy?: Record<string, 'asc' | 'desc'>;
  includeRelations?: boolean;
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

export interface IApplicationRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<Application | null>;
  findByIdWithRelations(id: string): Promise<Application | null>;
  findByUserId(userId: string, options?: FindApplicationsOptions): Promise<PaginatedResult<Application>>;
  findByJobId(jobId: string, options?: FindApplicationsOptions): Promise<PaginatedResult<Application>>;
  findActiveByUserAndJob(userId: string, jobId: string): Promise<Application | null>;
  save(application: Application): Promise<Application>;
  update(id: string, data: Partial<Application>): Promise<Application>;
  delete(id: string): Promise<Application>;
  countByJobId(jobId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}
