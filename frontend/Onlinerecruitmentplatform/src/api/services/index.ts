/**
 * API Services Index
 * Export all services from one place
 */

export { userService } from './userService';
export type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams
} from './userService';

export { jobService } from './jobService';
export type { CreateJobRequest, UpdateJobRequest, ApplyJobRequest, RepostJobRequest, JobSalary } from './jobService';

export { cvService } from './cvService';
export { applicationService } from './applicationService';
export type { ApplyForJobRequest, UpdateApplicationStatusRequest } from './applicationService';
export { companyService } from './companyService';
export type { RegisterCompanyRequest, UpdateCompanyRequest, InviteMemberRequest } from './companyService';

export { notificationService } from './notificationService';
export { cvTemplateService } from './cvTemplateService';
export { adminService } from './adminService';

