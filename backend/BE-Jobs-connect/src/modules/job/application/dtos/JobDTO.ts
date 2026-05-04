import type { JobType } from '../../domain/enums/JobType.js';
import type { JobStatus } from '../../domain/enums/JobStatus.js';
import type { ExperienceLevel } from '../../domain/enums/ExperienceLevel.js';
import type { CompanySize } from '@modules/company/domain/enums/CompanySize.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { SkillLevel } from '@modules/cv/domain/enums/SkillLevel.js';

// ============ Nested DTOs ============

export interface JobCompanyDTO {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  companySize?: CompanySize | null;
  status: UserStatus;
}

export interface JobSalaryDTO {
  id: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency: string;
  isNegotiable: boolean;
  hideAmount: boolean;
}

export interface JobBenefitDTO {
  id: string;
  title: string;
  description?: string | null;
}

export interface JobRequirementDTO {
  id: string;
  title: string;
  description?: string | null;
}

export interface JobSkillDTO {
  id: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number | null;
}

// ============ Job Output DTO ============

export interface JobOutputDTO {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location?: string | null;
  industry?: string | null;
  jobType?: JobType | null;
  experienceLevel?: ExperienceLevel | null;
  urgent: boolean;
  status: JobStatus;
  expiresAt?: Date | null;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
  company?: JobCompanyDTO;
  salary?: JobSalaryDTO | null;
  skills?: JobSkillDTO[];
  benefits?: JobBenefitDTO[];
  requirements?: JobRequirementDTO[];
}

// ============ Get All Jobs DTOs ============

export interface GetAllJobsInputDTO {
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
  status?: JobStatus;
  companyId?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy?: 'createdAt' | 'salary' | 'title' | 'applicationCount' | 'expiresAt' | 'urgent';
  order?: 'asc' | 'desc';
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllJobsOutputDTO {
  data: JobOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Job By ID DTOs ============

export interface GetJobByIdInputDTO {
  jobId: string;
  userId?: string;
  userRole?: string;
}

export interface GetJobByIdOutputDTO extends JobOutputDTO {}

// ============ Get Jobs By Company DTOs ============

export interface GetJobsByCompanyInputDTO {
  companyId: string;
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
  status?: JobStatus;
}

export interface GetJobsByCompanyOutputDTO {
  data: JobOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Search Jobs DTOs ============

export interface SearchJobsInputDTO {
  query?: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  status?: JobStatus;
  page?: number;
  limit?: number;
}

export interface SearchJobsOutputDTO {
  data: JobOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Create Job DTOs ============

export interface CreateJobSalaryInputDTO {
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string;
  isNegotiable?: boolean;
  hideAmount?: boolean;
}

export interface CreateJobBenefitInputDTO {
  title: string;
  description?: string | null;
}

export interface CreateJobRequirementInputDTO {
  title: string;
  description?: string | null;
}

export interface CreateJobSkillInputDTO {
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number | null;
}

export interface CreateJobInputDTO {
  userId: string;
  userRole?: string;
  companyId?: string;
  title: string;
  description: string;
  location?: string | null;
  industry?: string | null;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  urgent?: boolean;
  status?: JobStatus;
  expiresAt?: Date | null;
  salary?: CreateJobSalaryInputDTO;
  skills?: CreateJobSkillInputDTO[];
  benefits?: CreateJobBenefitInputDTO[];
  requirements?: CreateJobRequirementInputDTO[];
}

export interface CreateJobOutputDTO extends JobOutputDTO {}

// ============ Update Job DTOs ============

export interface UpdateJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
  title?: string;
  description?: string;
  location?: string | null;
  industry?: string | null;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  urgent?: boolean;
  status?: JobStatus;
  expiresAt?: Date | null;
  salary?: CreateJobSalaryInputDTO | null;
  skills?: CreateJobSkillInputDTO[];
  benefits?: CreateJobBenefitInputDTO[];
  requirements?: CreateJobRequirementInputDTO[];
}

export interface UpdateJobOutputDTO extends JobOutputDTO {}

// ============ Delete Job DTOs ============

export interface DeleteJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface DeleteJobOutputDTO {
  success: boolean;
  message: string;
}

// ============ Close/Repost Job DTOs ============

export interface CloseJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface CloseJobOutputDTO extends JobOutputDTO {}

export interface RepostJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
  expiresAt?: Date;
  publishNow?: boolean;
  title?: string;
  description?: string;
  location?: string | null;
  industry?: string | null;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  urgent?: boolean;
  salary?: CreateJobSalaryInputDTO;
  benefits?: CreateJobBenefitInputDTO[];
  requirements?: CreateJobRequirementInputDTO[];
}

export interface RepostJobOutputDTO extends JobOutputDTO {}

// ============ Approve/Reject Job DTOs ============

export interface ApproveJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface ApproveJobOutputDTO extends JobOutputDTO {}

export interface RejectJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
  reason?: string;
}

export interface RejectJobOutputDTO extends JobOutputDTO {}

// ============ Lock/Unlock Job DTOs ============

export interface LockJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface LockJobOutputDTO extends JobOutputDTO {}

export interface UnlockJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface UnlockJobOutputDTO extends JobOutputDTO {}

// ============ Similar Jobs DTOs ============

export interface GetSimilarJobsInputDTO {
  jobId: string;
  limit?: number;
  minSimilarity?: number;
}

export interface SimilarJobOutputDTO extends JobOutputDTO {
  similarity: number; // 0.0 to 1.0
}

export interface GetSimilarJobsOutputDTO {
  data: SimilarJobOutputDTO[];
}

// ============ Recommended Jobs DTOs ============

export interface GetRecommendedJobsInputDTO {
  userId: string;
  userRole?: string;
  page?: number;
  limit?: number;
}

export interface GetRecommendedJobsOutputDTO {
  data: JobOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Saved Jobs DTOs ============

export interface SaveJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface SaveJobOutputDTO {
  id: string;
  jobId: string;
  userId: string;
  createdAt: Date;
  job?: JobOutputDTO;
}

export interface UnsaveJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface UnsaveJobOutputDTO {
  success: boolean;
  message: string;
}

export interface GetSavedJobsInputDTO {
  userId: string;
  userRole?: string;
  page?: number;
  limit?: number;
}

export interface GetSavedJobsOutputDTO {
  data: SaveJobOutputDTO[];
  pagination: PaginationDTO;
}

export interface CheckJobSavedInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
}

export interface CheckJobSavedOutputDTO {
  isSaved: boolean;
}
