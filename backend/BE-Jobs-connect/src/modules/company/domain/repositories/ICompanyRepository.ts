import type { Company } from '../entities/Company.js';

export interface FindAllCompaniesOptions {
  page?: number;
  limit?: number;
  status?: string;
  companySize?: string;
  industry?: string;
  search?: string;
  orderBy?: Record<string, 'asc' | 'desc'>;
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

export interface ICompanyRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<Company | null>;
  findByIdWithMembers(id: string): Promise<Company | null>;
  findByIdWithoutMembers(id: string): Promise<Company | null>;
  findAll(options: FindAllCompaniesOptions): Promise<PaginatedResult<Company>>;
  save(company: Company): Promise<Company>;
  update(id: string, data: Partial<Company>): Promise<Company>;
  updateStatus(id: string, newStatus: string, currentStatus: string): Promise<Company | null>;
  delete(id: string): Promise<Company>;
  nameExists(name: string, excludeId?: string): Promise<boolean>;
}
