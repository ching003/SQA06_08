/**
 * CV Service
 * API calls cho CV management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, CVSearchParams } from '../types';
import { CV } from '../../lib/types';

export interface CreateCVRequest {
  title: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  currentPosition?: string;
  summary?: string;
  objective?: string;
  templateId?: string;
  isMain?: boolean;
  isOpenForJob?: boolean;
  // Nested data
  educations?: Array<{
    institution: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  workExperiences?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills?: Array<{
    skillName: string;
    level: string;
    yearsOfExperience?: number;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
    role?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    acquiredAt?: string;
    description?: string;
  }>;
  languages?: Array<{
    name: string;
    level: string;
    description?: string;
  }>;
  achievements?: Array<{
    title: string;
    description?: string;
    acquiredAt?: string;
  }>;
  activities?: Array<{
    title: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  references?: Array<{
    name: string;
    position?: string;
    company?: string;
    description?: string;
  }>;
}

export interface UpdateCVRequest extends Partial<CreateCVRequest> {}

class CVService {
  /**
   * Get all CVs with filters
   */
  async getCVs(params?: CVSearchParams): Promise<PaginatedResponse<CV>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.BASE,
      { params }
    );

    // Response interceptor returns response.data directly if it has 'success' property
    if (response && response.success) {
      // Case 1: { success: true, data: { cvs: [...], pagination: {...} } }
      if (response.data && response.data.cvs && Array.isArray(response.data.cvs)) {
        return {
          items: response.data.cvs,
          pagination: response.data.pagination || response.pagination || {
            total: response.data.cvs.length,
            page: 1,
            limit: response.data.cvs.length,
            totalPages: 1,
          },
        };
      }
      // Case 2: { success: true, data: CV[], pagination: {...} }
      if (Array.isArray(response.data) && response.pagination) {
        return {
          items: response.data,
          pagination: response.pagination,
        };
      }
      // Case 3: { success: true, data: { items: [...], pagination: {...} } }
      if (response.data && response.data.items) {
        return response.data;
      }
      // Case 4: { success: true, data: CV[] } - no pagination
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          pagination: {
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1,
          },
        };
      }
    }

    throw new Error(response?.message || 'Failed to get CVs');
  }

  /**
   * Get CV by ID
   */
  async getCVById(id: string): Promise<CV> {
    // Response interceptor already unwraps the response
    // So response is already ApiResponse<CV>, not AxiosResponse<ApiResponse<CV>>
    const apiResponse: any = await apiClient.get<ApiResponse<CV>>(
      API_ENDPOINTS.CVS.BY_ID(id)
    );

    console.log('getCVById response:', apiResponse);

    if (apiResponse && apiResponse.success && apiResponse.data) {
      // Case 1: { success: true, data: { cvs: [CV] } } - API returns array even for single CV
      if (apiResponse.data.cvs && Array.isArray(apiResponse.data.cvs) && apiResponse.data.cvs.length > 0) {
        console.log('Returning CV from cvs array:', apiResponse.data.cvs[0]);
        return apiResponse.data.cvs[0];
      }
      // Case 2: { success: true, data: CV } - API returns CV directly
      if (apiResponse.data.id) {
        console.log('Returning CV directly from data:', apiResponse.data);
        return apiResponse.data;
      }
      // Case 3: { success: true, data: { cv: CV } } - API returns nested cv object
      if (apiResponse.data.cv) {
        console.log('Returning CV from nested cv object:', apiResponse.data.cv);
        return apiResponse.data.cv;
      }
    }

    console.error('Failed to parse CV response:', apiResponse);
    throw new Error(apiResponse?.message || 'Failed to get CV');
  }

  /**
   * Create new CV
   */
  async createCV(data: CreateCVRequest): Promise<CV> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CVS.BASE,
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create CV');
  }

  /**
   * Update CV
   */
  async updateCV(id: string, data: UpdateCVRequest): Promise<CV> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.CVS.BY_ID(id),
      data
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update CV');
  }

  /**
   * Delete CV
   */
  async deleteCV(id: string): Promise<void> {
    const response: any = await apiClient.delete(
      API_ENDPOINTS.CVS.BY_ID(id)
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete CV');
    }
  }

  /**
   * Duplicate CV
   * Creates a copy of existing CV with all nested data
   * @param id - CV ID to duplicate
   * @param options - Optional: newTitle (default: "{Original Title} (Copy)"), isOpenForJob
   */
  async duplicateCV(id: string, options?: { newTitle?: string; isOpenForJob?: boolean }): Promise<CV> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CVS.DUPLICATE(id),
      options
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to duplicate CV');
  }

  /**
   * Export CV to PDF
   * Returns blob data for download
   * @param id - CV ID
   * @param options - Export options: templateId (optional), forceRegenerate (optional, default false)
   */
  async exportCV(id: string, options?: { templateId?: string; forceRegenerate?: boolean }): Promise<Blob> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CVS.EXPORT(id),
        {
          templateId: options?.templateId,
          forceRegenerate: options?.forceRegenerate ?? false,
        },
        {
          responseType: 'blob', // Important: expect binary data, not JSON
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Response interceptor returns blob directly when responseType is 'blob'
      if (response instanceof Blob) {
        // Check if blob is actually an error JSON response
        // Sometimes server returns JSON error even with blob responseType
        const blobText = await response.text();

        // Try to parse as JSON to check if it's an error
        try {
          const errorData = JSON.parse(blobText);
          if (errorData.success === false || errorData.error || errorData.message) {
            throw new Error(errorData.message || errorData.error || 'Failed to export CV');
          }
        } catch (parseError) {
          // Not JSON, it's a real PDF file - recreate blob with correct type
          return new Blob([blobText], { type: 'application/pdf' });
        }
      }

      // If response is already a blob, return it
      if (response instanceof Blob) {
        return response;
      }

      throw new Error('Failed to export CV: Invalid response format');
    } catch (error: any) {
      // If error response is a blob (JSON error), try to parse it
      if (error instanceof Blob) {
        try {
          const text = await error.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || 'Failed to export CV');
        } catch {
          throw new Error('Failed to export CV');
        }
      }

      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Failed to export CV');
    }
  }

  /**
   * Get CVs by user
   */
  async getCVsByUser(userId: string): Promise<CV[]> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.BY_USER(userId)
    );

    if (response.success && response.data) {
      // Case 1: { success: true, data: { cvs: [...] } }
      if (response.data.cvs && Array.isArray(response.data.cvs)) {
        return response.data.cvs;
      }
      // Case 2: { success: true, data: CV[] }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    throw new Error(response.message || 'Failed to get CVs by user');
  }

  /**
   * Set CV as main
   */
  async setCVAsMain(cvId: string): Promise<CV> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.CVS.SET_MAIN(cvId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to set CV as main');
  }

  /**
   * Search CVs
   */
  async searchCVs(params?: CVSearchParams): Promise<PaginatedResponse<CV>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.SEARCH,
      { params }
    );
    
    // Response interceptor returns response.data directly if it has 'success' property
    // API returns: { success: true, data: CV[], pagination: {...} }
    if (response && response.success) {
      // Check if data is array and pagination exists at root level
      if (Array.isArray(response.data) && response.pagination) {
        return {
          items: response.data,
          pagination: response.pagination,
        };
      }
      // Fallback: if data is already PaginatedResponse format with items
      if (response.data && response.data.items) {
        return response.data;
      }
    }
    
    throw new Error(response?.message || 'Failed to search CVs');
  }

  /**
   * Get recommended jobs for a CV (Candidate only)
   * Returns jobs with similarity scores from RecommendJobforCV table
   * @param cvId - CV ID to get job recommendations for
   * @param params - Optional params: limit (default: 10)
   */
  async getRecommendedJobsForCV(cvId: string, params?: { limit?: number }): Promise<any> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.RECOMMENDED_JOBS(cvId),
      { params }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get recommended jobs for CV');
  }

  /**
   * Get recommended CVs for job (Recruiter only)
   * @param jobId - Job ID to get recommendations for
   * @param params - Optional params: limit (default: 10)
   */
  async getRecommendedCVsForJob(jobId: string, params?: { limit?: number }): Promise<CV[]> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.RECOMMENDED_FOR_JOB(jobId),
      { params }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get recommended CVs for job');
  }

  // ==================== Saved CV Methods (Recruiter Only) ====================

  /**
   * Save a CV to favorites (Recruiter only)
   */
  async saveCV(cvId: string, notes?: string): Promise<SavedCV> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CVS.SAVE(cvId),
      notes ? { notes } : {}
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to save CV');
  }

  /**
   * Unsave a CV (Recruiter only)
   */
  async unsaveCV(cvId: string): Promise<void> {
    const response: any = await apiClient.delete(
      API_ENDPOINTS.CVS.SAVE(cvId)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unsave CV');
    }
  }

  /**
   * Get all saved CVs (Recruiter only)
   */
  async getSavedCVs(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<SavedCV>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.SAVED,
      { params }
    );
    
    if (response && response.success) {
      // Check if data is array and pagination exists at root level
      if (Array.isArray(response.data) && response.pagination) {
        return {
          items: response.data,
          pagination: response.pagination,
        };
      }
      // Fallback: if data is already PaginatedResponse format with items
      if (response.data && response.data.items) {
        return response.data;
      }
    }
    
    throw new Error(response?.message || 'Failed to get saved CVs');
  }

  /**
   * Update notes for a saved CV (Recruiter only)
   */
  async updateSavedCVNotes(cvId: string, notes: string): Promise<SavedCV> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.CVS.SAVE_NOTES(cvId),
      { notes }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update notes');
  }

  /**
   * Check if a CV is saved (Recruiter only)
   */
  async checkCVSaved(cvId: string): Promise<boolean> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CVS.CHECK_SAVED(cvId)
    );
    
    if (response.success && response.data) {
      return response.data.isSaved;
    }
    
    return false;
  }
}

// SavedCV type
export interface SavedCV {
  id: string;
  userId: string;
  cvId: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  cv?: CV & {
    user?: {
      id: string;
      email: string;
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export const cvService = new CVService();

