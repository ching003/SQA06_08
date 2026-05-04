import type { User } from '../entities/User.js';
import type { UserRole, UserStatus, Gender } from '../enums/index.js';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export interface UserWithCompanyMember {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  companyMember?: {
    id: string;
    role: string;
    joinedAt: Date;
    company?: {
      id: string;
      name: string;
      logoUrl: string | null;
    };
  } | null;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  role: string;
  dateOfBirth?: Date | null;
  status: string;
  avatarUrl?: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByIdWithCompanyMember(id: string): Promise<UserWithCompanyMember | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options: FindAllOptions): Promise<PaginatedResult<User>>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: Record<string, unknown>): Promise<User>;
  delete(id: string): Promise<User>;
  emailExists(email: string, excludeId?: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<User>;
  updateStatus(id: string, status: string): Promise<User>;
}
