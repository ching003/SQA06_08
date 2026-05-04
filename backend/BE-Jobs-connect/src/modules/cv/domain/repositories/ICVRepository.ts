import type { CV } from '../entities/CV.js';

export interface FindAllCVsOptions {
  page?: number;
  limit?: number;
  userId?: string;
  isMain?: boolean;
  isOpenForJob?: boolean;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface SearchCVsOptions {
  skills?: string[];
  location?: string;
  educationLevel?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindRecommendedForJobOptions {
  industry?: string | null;
  experienceLevel?: string | null;
  limit?: number;
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

export interface ICVRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<CV | null>;
  findByIdWithRelations(id: string): Promise<CV | null>;
  findByUserId(userId: string, options?: FindAllCVsOptions): Promise<CV[]>;
  findMainCVByUserId(userId: string): Promise<CV | null>;
  findAll(options: FindAllCVsOptions): Promise<PaginatedResult<CV>>;
  searchCVs(options: SearchCVsOptions): Promise<PaginatedResult<CV>>;
  findRecommendedForJob(options: FindRecommendedForJobOptions): Promise<CV[]>;
  findRecommendedJobsForCV(cvId: string, limit: number): Promise<any[]>;
  save(cv: CV): Promise<CV>;
  update(id: string, data: Partial<CV>): Promise<CV>;
  delete(id: string): Promise<CV>;
  unsetMainForUser(userId: string): Promise<void>;
  hasApplications(cvId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}
