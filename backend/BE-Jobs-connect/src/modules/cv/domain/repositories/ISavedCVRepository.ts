import type { SavedCV } from '../entities/SavedCV.js';

export interface FindSavedCVsOptions {
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

export interface ISavedCVRepository {
  findById(id: string): Promise<SavedCV | null>;
  findByUserId(userId: string, options?: FindSavedCVsOptions): Promise<PaginatedResult<SavedCV>>;
  findByUserAndCV(userId: string, cvId: string, include?: Record<string, unknown>): Promise<SavedCV | null>;
  isCVSaved(userId: string, cvId: string): Promise<boolean>;
  save(savedCV: SavedCV): Promise<SavedCV>;
  updateNotes(id: string, notes?: string | null): Promise<SavedCV>;
  delete(id: string): Promise<SavedCV>;
  deleteByUserAndCV(userId: string, cvId: string): Promise<SavedCV>;
  countByUserId(userId: string): Promise<number>;
}
