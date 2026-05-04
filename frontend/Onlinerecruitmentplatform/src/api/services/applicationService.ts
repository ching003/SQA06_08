/**
 * Application Service
 * API calls cho application management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, ApplicationSearchParams } from '../types';
import { Application } from '../../lib/types';

export interface UpdateApplicationStatusRequest {
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
}

export interface ApplyForJobRequest {
  jobId: string;
  cvId: string;
  coverLetter?: string;
}

class ApplicationService {
  /**
   * Apply for a job (Candidate only)
   */
  async applyForJob(data: ApplyForJobRequest): Promise<Application> {
    const response = await apiClient.post<ApiResponse<Application>>(
      API_ENDPOINTS.APPLICATIONS.BASE,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to apply for job');
  }

  /**
   * Get all applications with filters
   */
  async getApplications(params?: ApplicationSearchParams): Promise<PaginatedResponse<Application>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Application>>>(
      API_ENDPOINTS.APPLICATIONS.BASE,
      { params }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get applications');
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string): Promise<Application> {
    const response = await apiClient.get<ApiResponse<Application>>(
      API_ENDPOINTS.APPLICATIONS.BY_ID(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get application');
  }

  /**
   * Get my applications (Candidate only)
   */
  async getMyApplications(): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      API_ENDPOINTS.APPLICATIONS.MY
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get my applications');
  }

  /**
   * Withdraw application (Candidate only)
   */
  async withdrawApplication(id: string): Promise<Application> {
    const response = await apiClient.patch<ApiResponse<Application>>(
      API_ENDPOINTS.APPLICATIONS.WITHDRAW(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to withdraw application');
  }

  /**
   * Get applications by job (Recruiter only)
   */
  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      API_ENDPOINTS.APPLICATIONS.BY_JOB(jobId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get applications by job');
  }

  /**
   * Update application status (Recruiter/Admin only)
   */
  async updateApplicationStatus(
    id: string,
    data: UpdateApplicationStatusRequest
  ): Promise<Application> {
    const response = await apiClient.patch<ApiResponse<Application>>(
      API_ENDPOINTS.APPLICATIONS.UPDATE_STATUS(id),
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update application status');
  }
}

export const applicationService = new ApplicationService();

