import { UserRole, Gender, UserStatus } from '../../domain/enums/index.js';
import { CompanyRole } from '@modules/company/domain/enums/index.js';

export interface GetUserByIdInputDTO {
  id: string;
  viewerUserId?: string;
  viewerRole?: UserRole;
}

export interface CompanyMemberDTO {
  id: string;
  role: CompanyRole;
  joinedAt: Date;
  company?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export interface GetUserOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  companyMember?: CompanyMemberDTO | null;
}

export interface GetAllUsersInputDTO {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  viewerUserId?: string;
  viewerRole?: UserRole;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllUsersOutputDTO {
  data: GetUserOutputDTO[];
  pagination: PaginationDTO;
}

export interface GetUserInfoOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  avatarUrl: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface GetUserAgeOutputDTO {
  age: number;
}
