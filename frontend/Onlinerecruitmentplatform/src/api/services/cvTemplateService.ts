/**
 * CV Template Service
 * API calls cho CV template management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';
import { CVTemplate } from '../../lib/types';

export interface CVTemplateSearchParams extends PaginationParams {
  isActive?: boolean;
  orderBy?: string;
}

export interface CreateCVTemplateRequest {
  name: string;
  template?: File;
  htmlUrl?: string;
  preview?: File;
  previewUrl?: string;
  isActive?: boolean;
}

export interface UpdateCVTemplateRequest extends Partial<CreateCVTemplateRequest> {}

class CVTemplateService {
  /**
   * Get active templates (Public)
   */
  async getActiveTemplates(params?: PaginationParams): Promise<PaginatedResponse<CVTemplate>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CV_TEMPLATES.ACTIVE,
      { params }
    );
    
    // Response interceptor returns response.data directly if it has 'success' property
    // API returns: { success: true, data: CVTemplate[], pagination: {...} }
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
    
    throw new Error(response?.message || 'Failed to get active templates');
  }

  /**
   * Get all templates (Requires authentication)
   */
  async getTemplates(params?: CVTemplateSearchParams): Promise<PaginatedResponse<CVTemplate>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.CV_TEMPLATES.BASE,
      { params }
    );
    
    // Response interceptor returns response.data directly if it has 'success' property
    // API returns: { success: true, data: CVTemplate[], pagination: {...} }
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
    
    throw new Error(response?.message || 'Failed to get templates');
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<CVTemplate> {
    const response = await apiClient.get<ApiResponse<CVTemplate>>(
      API_ENDPOINTS.CV_TEMPLATES.BY_ID(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get template');
  }

  /**
   * Create template (Admin only)
   */
  async createTemplate(data: CreateCVTemplateRequest): Promise<CVTemplate> {
    // Handle file uploads with FormData
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.template) {
      formData.append('template', data.template);
    } else if (data.htmlUrl) {
      formData.append('htmlUrl', data.htmlUrl);
    }

    if (data.preview) {
      formData.append('preview', data.preview);
    } else if (data.previewUrl) {
      formData.append('previewUrl', data.previewUrl);
    }

    if (data.isActive !== undefined) {
      // Send as text string "true" or "false"
      formData.append('isActive', data.isActive ? 'true' : 'false');
    }

    const response = await apiClient.post<ApiResponse<CVTemplate>>(
      API_ENDPOINTS.CV_TEMPLATES.BASE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create template');
  }

  /**
   * Update template (Admin only)
   */
  async updateTemplate(id: string, data: UpdateCVTemplateRequest): Promise<CVTemplate> {
    // Handle file uploads with FormData
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.template) {
      formData.append('template', data.template);
    } else if (data.htmlUrl) {
      formData.append('htmlUrl', data.htmlUrl);
    }

    if (data.preview) {
      formData.append('preview', data.preview);
    } else if (data.previewUrl) {
      formData.append('previewUrl', data.previewUrl);
    }

    if (data.isActive !== undefined) {
      // Send as text string "true" or "false"
      formData.append('isActive', data.isActive ? 'true' : 'false');
    }

    const response = await apiClient.put<ApiResponse<CVTemplate>>(
      API_ENDPOINTS.CV_TEMPLATES.BY_ID(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update template');
  }

  /**
   * Delete template (Admin only)
   */
  async deleteTemplate(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.CV_TEMPLATES.BY_ID(id)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete template');
    }
  }

  /**
   * Activate template (Admin only)
   */
  async activateTemplate(id: string): Promise<CVTemplate> {
    const response = await apiClient.put<ApiResponse<CVTemplate>>(
      API_ENDPOINTS.CV_TEMPLATES.ACTIVATE(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to activate template');
  }

  /**
   * Deactivate template (Admin only)
   */
  async deactivateTemplate(id: string): Promise<CVTemplate> {
    const response = await apiClient.put<ApiResponse<CVTemplate>>(
      API_ENDPOINTS.CV_TEMPLATES.DEACTIVATE(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to deactivate template');
  }
}

export const cvTemplateService = new CVTemplateService();

