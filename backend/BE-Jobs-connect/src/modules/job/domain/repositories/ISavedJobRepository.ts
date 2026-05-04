import type { SavedJob } from '../entities/SavedJob.js';

export interface FindSavedJobsOptions {
  page?: number;
  limit?: number;
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

export interface ISavedJobRepository {
  findById(id: string): Promise<SavedJob | null>;
  findByUserId(userId: string, options?: FindSavedJobsOptions): Promise<PaginatedResult<SavedJob>>;
  findByUserAndJob(userId: string, jobId: string): Promise<SavedJob | null>;
  isJobSaved(userId: string, jobId: string): Promise<boolean>;
  save(savedJob: SavedJob): Promise<SavedJob>;
  delete(id: string): Promise<SavedJob>;
  deleteByUserAndJob(userId: string, jobId: string): Promise<SavedJob>;
  countByUserId(userId: string): Promise<number>;
}
