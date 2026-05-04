import type { PaginationDTO } from './CVDTO.js';

// ============ CV Template Output DTO ============

export interface CVTemplateOutputDTO {
  id: string;
  name: string;
  htmlUrl: string;
  previewUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Get All Templates DTOs ============

export interface GetAllTemplatesInputDTO {
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface GetAllTemplatesOutputDTO {
  data: CVTemplateOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Active Templates DTOs ============

export interface GetActiveTemplatesInputDTO {
  page?: number;
  limit?: number;
}

export interface GetActiveTemplatesOutputDTO {
  data: CVTemplateOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Template By ID DTOs ============

export interface GetTemplateByIdInputDTO {
  templateId: string;
  userId?: string;
  userRole?: string;
}

export interface GetTemplateByIdOutputDTO extends CVTemplateOutputDTO {}

// ============ Create Template DTOs ============

export interface TemplateFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface CreateTemplateInputDTO {
  userId?: string;
  userRole?: string;
  name: string;
  htmlUrl?: string;
  previewUrl?: string | null;
  isActive?: boolean;
  templateFile?: TemplateFileInput;
  previewFile?: TemplateFileInput;
}

export interface CreateTemplateOutputDTO extends CVTemplateOutputDTO {}

// ============ Update Template DTOs ============

export interface UpdateTemplateInputDTO {
  templateId: string;
  userId?: string;
  userRole?: string;
  name?: string;
  htmlUrl?: string;
  previewUrl?: string | null;
  isActive?: boolean;
  templateFile?: TemplateFileInput;
  previewFile?: TemplateFileInput;
}

export interface UpdateTemplateOutputDTO extends CVTemplateOutputDTO {}

// ============ Delete Template DTOs ============

export interface DeleteTemplateInputDTO {
  templateId: string;
  userId?: string;
  userRole?: string;
}

export interface DeleteTemplateOutputDTO {
  success: boolean;
  message: string;
}

// ============ Activate/Deactivate Template DTOs ============

export interface ActivateTemplateInputDTO {
  templateId: string;
  userId?: string;
  userRole?: string;
}

export interface ActivateTemplateOutputDTO extends CVTemplateOutputDTO {}

export interface DeactivateTemplateInputDTO {
  templateId: string;
  userId?: string;
  userRole?: string;
}

export interface DeactivateTemplateOutputDTO extends CVTemplateOutputDTO {}
