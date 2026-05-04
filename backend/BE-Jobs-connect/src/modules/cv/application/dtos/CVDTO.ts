import { Gender, UserStatus } from '@modules/user/domain/enums/index.js';
import { SkillLevel, LanguageLevel } from '../../domain/enums/index.js';

// ============ Nested CV Data DTOs ============

export interface CVSkillDTO {
  id?: string;
  skillName: string;
  level?: SkillLevel | null;
  yearsOfExperience?: number | null;
}

export interface EducationDTO {
  id?: string;
  institution: string;
  degree?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

export interface CertificationDTO {
  id?: string;
  name: string;
  issuer?: string | null;
  acquiredAt?: Date | null;
  description?: string | null;
}

export interface WorkExperienceDTO {
  id?: string;
  title: string;
  company: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

export interface ProjectDTO {
  id?: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  url?: string | null;
  role?: string | null;
}

export interface LanguageDTO {
  id?: string;
  name: string;
  level?: LanguageLevel | null;
  description?: string | null;
}

export interface AchievementDTO {
  id?: string;
  title: string;
  description?: string | null;
  acquiredAt?: Date | null;
}

export interface ActivityDTO {
  id?: string;
  title: string;
  organization?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

export interface ReferenceDTO {
  id?: string;
  name: string;
  position?: string | null;
  company?: string | null;
  description?: string | null;
}

// ============ CV Output DTO ============

export interface CVUserDTO {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
}

export interface CVTemplateInfoDTO {
  id: string;
  name: string;
  htmlUrl: string;
  previewUrl: string | null;
  isActive: boolean;
}

export interface CVOutputDTO {
  id: string;
  userId: string;
  templateId: string | null;
  title: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  address: string | null;
  currentPosition: string | null;
  summary: string | null;
  objective: string | null;
  isMain: boolean;
  isOpenForJob: boolean;
  pdfUrl: string | null;
  lastGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: CVUserDTO;
  template?: CVTemplateInfoDTO | null;
  skills?: CVSkillDTO[];
  educations?: EducationDTO[];
  certifications?: CertificationDTO[];
  workExperiences?: WorkExperienceDTO[];
  projects?: ProjectDTO[];
  languages?: LanguageDTO[];
  achievements?: AchievementDTO[];
  activities?: ActivityDTO[];
  references?: ReferenceDTO[];
}

// ============ Create CV DTOs ============

export interface CreateCVInputDTO {
  userId: string;
  userRole?: string;
  templateId?: string | null;
  title: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  currentPosition?: string | null;
  summary?: string | null;
  objective?: string | null;
  isMain?: boolean;
  isOpenForJob?: boolean;
  skills?: CVSkillDTO[];
  educations?: EducationDTO[];
  certifications?: CertificationDTO[];
  workExperiences?: WorkExperienceDTO[];
  projects?: ProjectDTO[];
  languages?: LanguageDTO[];
  achievements?: AchievementDTO[];
  activities?: ActivityDTO[];
  references?: ReferenceDTO[];
}

export interface CreateCVOutputDTO extends CVOutputDTO {}

// ============ Update CV DTOs ============

export interface UpdateCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
  templateId?: string | null;
  title?: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  currentPosition?: string | null;
  summary?: string | null;
  objective?: string | null;
  isMain?: boolean;
  isOpenForJob?: boolean;
  skills?: CVSkillDTO[];
  educations?: EducationDTO[];
  certifications?: CertificationDTO[];
  workExperiences?: WorkExperienceDTO[];
  projects?: ProjectDTO[];
  languages?: LanguageDTO[];
  achievements?: AchievementDTO[];
  activities?: ActivityDTO[];
  references?: ReferenceDTO[];
}

export interface UpdateCVOutputDTO extends CVOutputDTO {}

// ============ Delete CV DTOs ============

export interface DeleteCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
}

export interface DeleteCVOutputDTO {
  success: boolean;
  message: string;
}

// ============ Get CV DTOs ============

export interface GetCVByIdInputDTO {
  cvId: string;
  userId?: string;
  userRole?: string;
}

export interface GetCVByIdOutputDTO extends CVOutputDTO {}

export interface GetCVsByUserInputDTO {
  targetUserId: string;
  userId: string;
  userRole?: string;
}

export interface GetCVsByUserOutputDTO {
  cvs: CVOutputDTO[];
}

export interface GetAllCVsInputDTO {
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
  isOpenForJob?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllCVsOutputDTO {
  data: CVOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Set Main CV DTOs ============

export interface SetMainCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
}

export interface SetMainCVOutputDTO extends CVOutputDTO {}

// ============ Export CV DTOs ============

export interface ExportCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
  templateId?: string;
  forceRegenerate?: boolean;
}

export interface ExportCVOutputDTO {
  pdfBuffer: Buffer;
  filename: string;
}

// ============ Search CV DTOs ============

export interface SearchCVsInputDTO {
  userId?: string;
  userRole?: string;
  search?: string;
  skills?: string[];
  location?: string;
  educationLevel?: string;
  page?: number;
  limit?: number;
}

export interface SearchCVsOutputDTO {
  data: CVOutputDTO[];
  pagination: PaginationDTO;
}

// ============ Get Recommended CVs for Job DTOs ============

export interface GetRecommendedCVsForJobInputDTO {
  jobId: string;
  userId: string;
  userRole?: string;
  limit?: number;
}

export interface RecommendedCVOutputDTO {
  id: string;
  title: string;
  fullName: string | null;
  currentPosition: string | null;
  skills: Array<{
    id: string;
    skillName: string;
    level: string | null;
    yearsOfExperience: number | null;
  }>;
  workExperiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string | null;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
  }>;
}

export interface GetRecommendedCVsForJobOutputDTO {
  data: RecommendedCVOutputDTO[];
}

// ============ Duplicate CV DTOs ============

export interface DuplicateCVInputDTO {
  cvId: string;
  userId: string;
  newTitle?: string;
  isOpenForJob?: boolean;
}

export interface DuplicateCVOutputDTO extends CVOutputDTO {}

// ============ Get Recommended Jobs for CV DTOs ============

export interface GetRecommendedJobsForCVInputDTO {
  cvId: string;
  userId: string;
  userRole?: string;
  limit?: number;
}

export interface RecommendedJobForCVOutputDTO {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  industry: string | null;
  similarity: number;
  salary?: {
    minAmount: number | null;
    maxAmount: number | null;
    currency: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  createdAt: Date;
}

export interface GetRecommendedJobsForCVOutputDTO {
  data: RecommendedJobForCVOutputDTO[];
}