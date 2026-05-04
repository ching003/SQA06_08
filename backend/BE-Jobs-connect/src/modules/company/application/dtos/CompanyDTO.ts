import type { CompanySize } from '../../domain/enums/CompanySize.js';
import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';

// ============ Company Registration DTOs ============

export interface RegisterCompanyInputDTO {
  name: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: CompanySize | null;
  foundedYear?: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  ownerId: string;
  userId?: string;
  logoFile?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
  documentFile?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

export interface CompanyMemberOutputDTO {
  id: string;
  userId: string;
  companyId: string;
  companyRole: CompanyRole;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    status: UserStatus;
  };
}

export interface CompanyOutputDTO {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  industry: string | null;
  companySize: CompanySize | null;
  foundedYear: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: UserStatus;
  documentUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  members?: CompanyMemberOutputDTO[];
}

export interface RegisterCompanyOutputDTO extends CompanyOutputDTO {}

// ============ Company Approval DTOs ============

export interface ApproveCompanyInputDTO {
  companyId: string;
  adminId: string;
}

export interface ApproveCompanyOutputDTO extends CompanyOutputDTO {}

export interface RejectCompanyInputDTO {
  companyId: string;
  adminId: string;
  reason?: string;
}

export interface RejectCompanyOutputDTO extends CompanyOutputDTO {}

export interface LockCompanyInputDTO {
  companyId: string;
  adminId: string;
}

export interface LockCompanyOutputDTO extends CompanyOutputDTO {}

export interface UnlockCompanyInputDTO {
  companyId: string;
  adminId: string;
}

export interface UnlockCompanyOutputDTO extends CompanyOutputDTO {}

// ============ Company CRUD DTOs ============

export interface GetCompanyByIdInputDTO {
  companyId: string;
  userId?: string;
  userRole?: string;
}

export interface GetCompanyByIdOutputDTO extends CompanyOutputDTO {}

export interface GetAllCompaniesInputDTO {
  page?: number;
  limit?: number;
  status?: UserStatus;
  size?: CompanySize;
  industry?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  userRole?: string;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllCompaniesOutputDTO {
  data: CompanyOutputDTO[];
  pagination: PaginationDTO;
}

export interface UpdateCompanyInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
  name?: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: CompanySize | null;
  foundedYear?: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoFile?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
  bannerFile?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

export interface UpdateCompanyOutputDTO extends CompanyOutputDTO {}

export interface DeleteCompanyInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
}

export interface DeleteCompanyOutputDTO {
  success: boolean;
  message: string;
}

// ============ File Upload DTOs ============

export interface UploadLogoInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

export interface UploadLogoOutputDTO {
  logoUrl: string;
}

export interface UploadBannerInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

export interface UploadBannerOutputDTO {
  bannerUrl: string;
}
