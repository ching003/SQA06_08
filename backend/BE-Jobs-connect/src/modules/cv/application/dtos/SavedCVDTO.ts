import type { CVOutputDTO, PaginationDTO } from './CVDTO.js';

// ============ Save CV DTOs ============

export interface SaveCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
  notes?: string | null;
}

export interface SaveCVOutputDTO {
  id: string;
  userId: string;
  cvId: string;
  notes: string | null;
  createdAt: Date;
  cv?: CVOutputDTO;
}

// ============ Unsave CV DTOs ============

export interface UnsaveCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
}

export interface UnsaveCVOutputDTO {
  success: boolean;
  message: string;
}

// ============ Get Saved CVs DTOs ============

export interface GetSavedCVsInputDTO {
  userId: string;
  userRole?: string;
  page?: number;
  limit?: number;
}

export interface SavedCVItemDTO {
  id: string;
  userId: string;
  cvId: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  cv?: CVOutputDTO;
}

export interface GetSavedCVsOutputDTO {
  data: SavedCVItemDTO[];
  pagination: PaginationDTO;
}

// ============ Update Saved CV Notes DTOs ============

export interface UpdateSavedCVNotesInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
  notes?: string;
}

export interface UpdateSavedCVNotesOutputDTO {
  id: string;
  notes: string | null;
  updatedAt: Date;
}

// ============ Check CV Saved DTOs ============

export interface CheckCVSavedInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
}

export interface CheckCVSavedOutputDTO {
  isSaved: boolean;
}
