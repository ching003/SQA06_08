import type { Job } from '../entities/Job.js';
import type { SimilarJob } from '../entities/SimilarJob.js';
import type { JobStatus } from '../enums/JobStatus.js';

export interface FindAllJobsOptions {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
  jobType?: string;
  experienceLevel?: string;
  search?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  orderBy?: Record<string, unknown>;
  hasSalary?: boolean;
}

export interface SearchJobsOptions {
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: string;
  page?: number;
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

export interface CreateJobSalaryData {
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string;
  isNegotiable?: boolean;
  hideAmount?: boolean;
}

export interface CreateJobBenefitData {
  title: string;
  description?: string | null;
}

export interface CreateJobRequirementData {
  title: string;
  description?: string | null;
}

export interface CreateJobSkillData {
  skillName: string;
  level: string;
  yearsOfExperience?: number | null;
}

export interface CreateJobData {
  companyId: string;
  title: string;
  description: string;
  location: string;
  industry: string;
  jobType: string;
  experienceLevel: string;
  urgent?: boolean;
  status?: JobStatus;
  expiresAt?: Date;
  salary?: CreateJobSalaryData;
  skills?: CreateJobSkillData[];
  benefits?: CreateJobBenefitData[];
  requirements?: CreateJobRequirementData[];
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  location?: string;
  industry?: string;
  jobType?: string;
  experienceLevel?: string;
  urgent?: boolean;
  status?: JobStatus;
  expiresAt?: Date;
  salary?: CreateJobSalaryData | null;
  skills?: CreateJobSkillData[];
  benefits?: CreateJobBenefitData[];
  requirements?: CreateJobRequirementData[];
}

export interface IJobRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<Job | null>;
  findByIdWithRelations(id: string): Promise<Job | null>;
  findByCompanyId(companyId: string, options?: FindAllJobsOptions): Promise<PaginatedResult<Job>>;
  findAll(options: FindAllJobsOptions): Promise<PaginatedResult<Job>>;
  findActiveJobs(options?: FindAllJobsOptions): Promise<PaginatedResult<Job>>;
  searchJobs(options: SearchJobsOptions): Promise<PaginatedResult<Job>>;
  save(job: Job): Promise<Job>;
  create(data: CreateJobData): Promise<Job>;
  update(id: string, data: Partial<Job> | UpdateJobData): Promise<Job>;
  updateWithRelations(id: string, data: UpdateJobData): Promise<Job>;
  delete(id: string): Promise<Job>;
  incrementApplicationCount(id: string): Promise<Job>;
  findSimilarJobs(jobId: string, limit?: number): Promise<Job[]>;
  findSimilarJobsFromTable(jobId: string, limit?: number, minSimilarity?: number): Promise<SimilarJob[]>;
  updateJobsByCompanyId(companyId: string, data: Partial<Job>): Promise<number>;
}
