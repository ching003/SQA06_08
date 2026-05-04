/**
 * API Response Types
 * Định nghĩa types cho API responses
 */

// Standard API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Login Response
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
  };
  token: string;
  expiresIn: string;
}

// Register Response
export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface JobSearchParams extends PaginationParams {
  query?: string;          // Từ khóa tìm kiếm (match với backend)
  search?: string;         // Deprecated: use 'query' instead (kept for backward compatibility)
  location?: string;       // Địa điểm
  industry?: string;       // Ngành nghề
  jobType?: string;        // Loại công việc (backend expects 'jobType')
  type?: string;           // Alias của jobType (kept for backward compatibility)
  experienceLevel?: string; // Cấp độ kinh nghiệm
  salaryMin?: number;      // Mức lương tối thiểu (phải > 0)
  salaryMax?: number;      // Mức lương tối đa (phải > 0)
  status?: string;         // Trạng thái job
  urgent?: boolean;        // Tìm việc gấp
  companyId?: string;      // UUID của công ty
  sortBy?: string;         // Trường sắp xếp (e.g., 'salary', 'createdAt')
  order?: 'asc' | 'desc';  // Thứ tự sắp xếp
}

export interface CVSearchParams extends PaginationParams {
  userId?: string;
  isMain?: boolean;
  isOpenForJob?: boolean;
  orderBy?: string; // Format: "field:direction" (e.g., "createdAt:desc")
  // Search-specific params (for /api/cvs/search endpoint)
  query?: string; // Text search in title, summary, skills, etc.
  skills?: string | string[]; // Filter by skills (comma-separated or array)
  location?: string; // Filter by location
  educationLevel?: string; // Filter by education level
}

export interface ApplicationSearchParams extends PaginationParams {
  userId?: string;
  jobId?: string;
  status?: string;
  orderBy?: string;
}

export interface NotificationSearchParams extends PaginationParams {
  type?: string;
  isRead?: boolean;
}

export interface CompanySearchParams extends PaginationParams {
  status?: string;
  industry?: string;
  companySize?: string;
}

export interface CVTemplateSearchParams extends PaginationParams {
  isActive?: boolean;
  orderBy?: string;
}

