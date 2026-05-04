import type { CompanyMember } from '../entities/CompanyMember.js';

export interface ICompanyMemberRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<CompanyMember | null>;
  findByUserId(userId: string, include?: Record<string, unknown>): Promise<CompanyMember | null>;
  findByCompanyId(companyId: string, include?: Record<string, unknown>): Promise<CompanyMember[]>;
  findByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMember | null>;
  findByRole(companyId: string, role: string): Promise<CompanyMember[]>;
  userIsMember(userId: string, companyId: string): Promise<boolean>;
  save(member: CompanyMember): Promise<CompanyMember>;
  update(id: string, data: Partial<CompanyMember>): Promise<CompanyMember>;
  delete(id: string): Promise<CompanyMember>;
  countByCompanyId(companyId: string): Promise<number>;
}
