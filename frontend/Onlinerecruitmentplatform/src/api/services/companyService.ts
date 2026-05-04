/**
 * Company Service
 * API calls cho company management
 */

import apiClient, { asApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse } from '../types';
import { Company, CompanyMember, CompanyMemberInvitation } from '../../lib/types';

export interface RegisterCompanyRequest {
  name: string;
  website?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
  document: File; // Required file
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
}

export interface InviteMemberRequest {
  email: string;
  role: 'OWNER' | 'MANAGER' | 'RECRUITER' | 'VIEWER';
}

export interface CompanySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  size?: string;
  industry?: string;
  orderBy?: string;
}

class CompanyService {
  /**
   * Get all companies
   */
  async getCompanies(params?: CompanySearchParams): Promise<PaginatedResponse<Company>> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.COMPANIES.BASE,
      { params }
    );
    
    console.log('[companyService.getCompanies] Raw response:', response);
    
    // Response interceptor returns response.data directly if it has 'success' property
    // API returns: { success: true, data: Company[], pagination: {...} }
    if (response && response.success) {
      // Check if data is array and pagination exists at root level
      if (Array.isArray(response.data) && response.pagination) {
        console.log('[companyService.getCompanies] Format 1: data array with pagination at root');
        return {
          items: response.data,
          pagination: response.pagination,
        };
      }
      // Fallback: if data is already PaginatedResponse format with items
      if (response.data && response.data.items && response.data.pagination) {
        console.log('[companyService.getCompanies] Format 2: nested items');
        return response.data;
      }
    }
    
    console.error('[companyService.getCompanies] Unexpected response format:', response);
    throw new Error(response?.message || 'Failed to get companies');
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.BY_ID(id)
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to get company');
  }

  /**
   * Register new company (multipart/form-data)
   */
  async registerCompany(data: RegisterCompanyRequest): Promise<Company> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.website) formData.append('website', data.website);
    if (data.description) formData.append('description', data.description);
    if (data.industry) formData.append('industry', data.industry);
    if (data.companySize) formData.append('companySize', data.companySize);
    if (data.foundedYear) formData.append('foundedYear', String(data.foundedYear));
    if (data.address) formData.append('address', data.address);
    if (data.phone) formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.logo) formData.append('logo', data.logo);
    formData.append('document', data.document); // Required
    
    const response = await apiClient.post<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.REGISTER,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to register company');
  }

  /**
   * Update company (multipart/form-data)
   */
  async updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.website) formData.append('website', data.website);
    if (data.description) formData.append('description', data.description);
    if (data.industry) formData.append('industry', data.industry);
    if (data.companySize) formData.append('companySize', data.companySize);
    if (data.foundedYear) formData.append('foundedYear', String(data.foundedYear));
    if (data.address) formData.append('address', data.address);
    if (data.phone) formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.logo) formData.append('logo', data.logo);
    if (data.banner) formData.append('banner', data.banner);
    
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.BY_ID(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to update company');
  }

  /**
   * Delete company (Admin or Owner only)
   */
  async deleteCompany(companyId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.COMPANIES.BY_ID(companyId)
    );
    const apiResponse = asApiResponse<void>(response);

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to delete company');
    }
  }

  /**
   * Get company members
   */
  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    const response = await apiClient.get<ApiResponse<{ members: CompanyMember[] }>>(
      API_ENDPOINTS.COMPANIES.MEMBERS(companyId)
    );
    const apiResponse = asApiResponse<{ members: CompanyMember[] }>(response);

    if (apiResponse.success && apiResponse.data) {
      // API returns { members: [...] } so extract the array
      return apiResponse.data.members || [];
    }

    throw new Error(apiResponse.message || 'Failed to get company members');
  }

  /**
   * Invite member to company
   */
  async inviteMember(companyId: string, data: InviteMemberRequest): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `${API_ENDPOINTS.COMPANIES.MEMBERS(companyId)}/invite`,
      data
    );
    const apiResponse = asApiResponse<any>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to invite member');
  }

  /**
   * Remove member from company
   */
  async removeMember(companyId: string, memberId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.COMPANIES.MEMBERS(companyId)}/${memberId}`
    );
    const apiResponse = asApiResponse<void>(response);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to remove member');
    }
  }

  /**
   * Upload company logo
   */
  async uploadLogo(companyId: string, file: File): Promise<Company> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.UPLOAD_LOGO(companyId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to upload logo');
  }

  /**
   * Upload company banner
   */
  async uploadBanner(companyId: string, file: File): Promise<Company> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.UPLOAD_BANNER(companyId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to upload banner');
  }

  /**
   * Approve company (Admin only)
   */
  async approveCompany(companyId: string): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.APPROVE(companyId)
    );
    const apiResponse = asApiResponse<Company>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to approve company');
  }

  /**
   * Reject company (Admin only)
   */
  async rejectCompany(companyId: string, reason?: string): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.REJECT(companyId),
      reason ? { reason } : undefined
    );
    const apiResponse = asApiResponse<Company>(response);

    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }

    throw new Error(apiResponse.message || 'Failed to reject company');
  }

  /**
   * Lock company (Admin only)
   */
  async lockCompany(companyId: string): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.LOCK(companyId)
    );
    const apiResponse = asApiResponse<Company>(response);

    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }

    throw new Error(apiResponse.message || 'Failed to lock company');
  }

  /**
   * Unlock company (Admin only)
   */
  async unlockCompany(companyId: string): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>(
      API_ENDPOINTS.COMPANIES.UNLOCK(companyId)
    );
    const apiResponse = asApiResponse<Company>(response);

    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }

    throw new Error(apiResponse.message || 'Failed to unlock company');
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.COMPANIES.ACCEPT_INVITATION(invitationId)
    );
    const apiResponse = asApiResponse<any>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to accept invitation');
  }

  /**
   * Reject invitation
   */
  async rejectInvitation(invitationId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.COMPANIES.REJECT_INVITATION(invitationId)
    );
    const apiResponse = asApiResponse<void>(response);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to reject invitation');
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(companyId: string, memberId: string, role: string): Promise<CompanyMember> {
    const response = await apiClient.put<ApiResponse<CompanyMember>>(
      API_ENDPOINTS.COMPANIES.UPDATE_MEMBER_ROLE(companyId, memberId),
      { role }
    );
    const apiResponse = asApiResponse<CompanyMember>(response);
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    throw new Error(apiResponse.message || 'Failed to update member role');
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(companyId: string, invitationId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.COMPANIES.CANCEL_INVITATION(companyId, invitationId)
    );
    const apiResponse = asApiResponse<void>(response);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to cancel invitation');
    }
  }

  /**
   * Get company invitations
   */
  async getCompanyInvitations(companyId: string, params?: { status?: string }): Promise<CompanyMemberInvitation[]> {
    const response = await apiClient.get<ApiResponse<{ invitations: CompanyMemberInvitation[] }>>(
      API_ENDPOINTS.COMPANIES.INVITATIONS(companyId),
      { params }
    );
    const apiResponse = asApiResponse<{ invitations: CompanyMemberInvitation[] }>(response);

    if (apiResponse.success && apiResponse.data) {
      // API returns { invitations: [...] } so extract the array
      return apiResponse.data.invitations || [];
    }

    throw new Error(apiResponse.message || 'Failed to get company invitations');
  }

}

export const companyService = new CompanyService();

