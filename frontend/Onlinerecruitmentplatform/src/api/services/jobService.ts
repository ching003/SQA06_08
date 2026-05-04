/**
 * Job Service
 * API calls cho job management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, JobSearchParams, PaginationParams } from '../types';
import { Job, SkillLevel } from '../../lib/types';

export interface JobSalary {
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  isNegotiable?: boolean;
  hideAmount?: boolean;
}

export interface JobSkillInput {
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number | null;
}

export interface CreateJobRequest {
  title: string;
  description?: string;
  location?: string;
  industry?: string;
  experienceLevel?: string;
  type?: string;
  salary?: JobSalary;
  urgent?: boolean;
  status?: string; // DRAFT, ACTIVE, etc.
  expiresAt?: string;
  benefits?: Array<{ title: string; description?: string }>;
  requirements?: Array<{ title: string; description?: string }>;
  skills?: JobSkillInput[];
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: string;
}

export interface ApplyJobRequest {
  jobId: string;
  cvId: string;
  coverLetter?: string;
}

export interface RepostJobRequest {
  publishNow?: boolean;
  expiresAt?: string;
  title?: string;
  description?: string;
  location?: string;
  industry?: string;
  experienceLevel?: string;
  type?: string;
  urgent?: boolean;
  salary?: JobSalary;
  benefits?: Array<{ title: string; description?: string }>;
  requirements?: Array<{ title: string; description?: string }>;
  skills?: JobSkillInput[];
}

class JobService {
  /**
   * Get all jobs with filters
   */
  async getJobs(params?: JobSearchParams): Promise<PaginatedResponse<Job>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.JOBS.BASE,
      { params }
    );
        
    // Handle different response structures
    if (response && response.success) {
      // Case 1: { success: true, data: Job[], pagination: {...} } - Standard format
      if (Array.isArray(response.data) && response.pagination) {
        return {
          items: response.data,
          pagination: response.pagination,
        };
      }
      // Case 2: { success: true, data: { items: Job[], pagination: {...} } }
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return response.data;
      }
      // Case 3: { success: true, data: { jobs: Job[], pagination: {...} } }
      if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
        return {
          items: response.data.jobs,
          pagination: response.data.pagination || response.pagination,
        };
      }
      // Case 4: Already in PaginatedResponse format
      if (response.data && response.data.items) {
        return response.data;
      }
    }
    
    throw new Error(response?.message || 'Failed to get jobs');
  }

  /**
   * Search jobs (Public endpoint)
   */
  async searchJobs(params?: JobSearchParams): Promise<PaginatedResponse<Job>> {
    // Normalize params to match backend API expectations
    const normalizedParams: any = { ...params };

    // Convert 'search' to 'query' if exists (backward compatibility)
    if (normalizedParams.search && !normalizedParams.query) {
      normalizedParams.query = normalizedParams.search;
      delete normalizedParams.search;
    }

    // Convert 'type' to 'jobType' if exists (backend expects 'jobType')
    if (normalizedParams.type && !normalizedParams.jobType) {
      normalizedParams.jobType = normalizedParams.type;
      delete normalizedParams.type;
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      API_ENDPOINTS.JOBS.SEARCH,
      { params: normalizedParams }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to search jobs');
  }

  /**
   * Get job by ID
   */
  async getJobById(id: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.BY_ID(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get job');
  }

  /**
   * Create new job (Recruiter only)
   */
  async createJob(data: CreateJobRequest): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.BASE,
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create job');
  }

  /**
   * Update job (Recruiter/Admin only)
   */
  async updateJob(id: string, data: UpdateJobRequest): Promise<Job> {
    const response = await apiClient.put<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.BY_ID(id),
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update job');
  }

  /**
   * Delete job (Recruiter/Admin only)
   */
  async deleteJob(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.JOBS.BY_ID(id)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete job');
    }
  }

  /**
   * Apply to job (Note: This should use /api/applications endpoint)
   * Keeping this for backward compatibility, but the actual endpoint is /api/applications
   */
  async applyToJob(jobId: string, data: { cvId: string; coverLetter?: string }): Promise<any> {
    // The correct endpoint is /api/applications, not /api/jobs/:id/apply
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.APPLICATIONS.BASE,
      {
        jobId,
        cvId: data.cvId,
        coverLetter: data.coverLetter,
      }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to apply to job');
  }

  /**
   * Save job
   */
  async saveJob(jobId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.JOBS.SAVE(jobId)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to save job');
    }
  }

  /**
   * Unsave job
   * Note: Uses DELETE method on the same endpoint as save (/api/jobs/:id/save)
   */
  async unsaveJob(jobId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.JOBS.SAVE(jobId)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unsave job');
    }
  }

  /**
   * Get recommended jobs for current user
   */
  async getRecommendedJobs(params?: PaginationParams): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      API_ENDPOINTS.JOBS.RECOMMENDED,
      { params }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get recommended jobs');
  }

  /**
   * Get jobs by company
   */
  async getJobsByCompany(companyId: string, params?: PaginationParams): Promise<PaginatedResponse<Job>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.JOBS.BY_COMPANY(companyId),
      { params }
    );
    
    // Case 0: Response is a direct array of jobs
    if (Array.isArray(response)) {
      return {
        items: response,
        pagination: {
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        },
      };
    }
    
    // Handle different response structures
    if (response && response.success) {
      // Case 1: { success: true, data: Job[] } - Direct array in data
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          pagination: response.pagination || {
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1,
          },
        };
      }
      // Case 2: { success: true, data: { items: Job[], pagination: {...} } }
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return response.data;
      }
      // Case 3: { success: true, data: { jobs: Job[], pagination: {...} } }
      if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
        return {
          items: response.data.jobs,
          pagination: response.data.pagination || response.pagination,
        };
      }
    }
    
    throw new Error(response?.message || 'Failed to get jobs by company');
  }

  /**
   * Close job (Recruiter only)
   */
  async closeJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.CLOSE(jobId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to close job');
  }

  /**
   * Repost job (Recruiter only)
   */
  async repostJob(jobId: string, data?: RepostJobRequest): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.REPOST(jobId),
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to repost job');
  }

  /**
   * Approve job (Admin only)
   */
  async approveJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.APPROVE(jobId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to approve job');
  }

  /**
   * Reject job (Admin only)
   */
  async rejectJob(jobId: string, reason?: string): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.REJECT(jobId),
      reason ? { reason } : undefined
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to reject job');
  }

  /**
   * Lock job (Admin only)
   */
  async lockJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.LOCK(jobId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to lock job');
  }

  /**
   * Unlock job (Admin only)
   */
  async unlockJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>(
      API_ENDPOINTS.JOBS.UNLOCK(jobId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to unlock job');
  }

  /**
   * Get saved jobs (Candidate only)
   */
  async getSavedJobs(params?: PaginationParams): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<ApiResponse<any>>(
      API_ENDPOINTS.JOBS.SAVED,
      { params }
    );
    
    // API returns: { success: true, data: { savedJobs: [...], pagination: {...} } }
    // After interceptor, response is already ApiResponse
    // After this function, we return the data object: { savedJobs: [...], pagination: {...} }
    if (response.success && response.data) {
      // If data has savedJobs, return it directly (it's already the structure we need)
      if ((response.data as any).savedJobs) {
        return response.data as any;
      }
      // Otherwise return data as PaginatedResponse
      return response.data;
    }
    
    throw new Error((response as any).message || 'Failed to get saved jobs');
  }

  /**
   * Get similar jobs (Public)
   * Returns jobs with similarity scores
   */
  async getSimilarJobs(
    jobId: string, 
    params?: { limit?: number; minSimilarity?: number }
  ): Promise<{ jobs: Array<Job & { similarity?: number }> }> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.JOBS.SIMILAR(jobId),
      { params }
    );
    
    // API returns: { success: true, data: { jobs: [...], similarity: number } }
    if (response && response.success && response.data) {
      // Case 1: { success: true, data: { jobs: [...] } }
      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        return { jobs: response.data.jobs };
      }
      // Case 2: { success: true, data: [...] } - Direct array
      if (Array.isArray(response.data)) {
        return { jobs: response.data };
      }
    }
    
    throw new Error(response?.message || 'Failed to get similar jobs');
  }
}

export const jobService = new JobService();

