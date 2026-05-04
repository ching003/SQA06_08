import { ApplicationStatus } from '../../domain/enums/index.js';

// ============ Nested DTOs ============

export interface ApplicationUserDTO {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface ApplicationJobDTO {
  id: string;
  title: string;
  companyId: string;
  companyName?: string;
}

export interface ApplicationCVDTO {
  id: string;
  title: string;
}

// ============ Application Output DTO ============

export interface ApplicationOutputDTO {
  id: string;
  userId: string;
  jobId: string;
  cvId: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: ApplicationUserDTO;
  job?: ApplicationJobDTO;
  cv?: ApplicationCVDTO;
}

// ============ Apply Job DTOs ============

export interface ApplyJobInputDTO {
  userId: string;
  userRole?: string;
  jobId: string;
  cvId: string;
  coverLetter?: string;
}

export interface ApplyJobOutputDTO extends ApplicationOutputDTO {}

// ============ Get My Applications DTOs ============

export interface GetMyApplicationsInputDTO {
  userId: string;
  userRole?: string;
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetMyApplicationsOutputDTO {
  data: ApplicationOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Application By ID DTOs ============

export interface GetApplicationByIdInputDTO {
  applicationId: string;
  userId: string;
  userRole?: string;
}

export interface GetApplicationByIdOutputDTO extends ApplicationOutputDTO {}

// ============ Get Applications By Job DTOs ============

export interface GetApplicationsByJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

export interface GetApplicationsByJobOutputDTO {
  data: ApplicationOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Update Application Status DTOs ============

export interface UpdateApplicationStatusInputDTO {
  applicationId: string;
  userId: string;
  userRole?: string;
  status: ApplicationStatus;
  notes?: string;
}

export interface UpdateApplicationStatusOutputDTO extends ApplicationOutputDTO {}

// ============ Withdraw Application DTOs ============

export interface WithdrawApplicationInputDTO {
  applicationId: string;
  userId: string;
  userRole?: string;
}

export interface WithdrawApplicationOutputDTO extends ApplicationOutputDTO {}
