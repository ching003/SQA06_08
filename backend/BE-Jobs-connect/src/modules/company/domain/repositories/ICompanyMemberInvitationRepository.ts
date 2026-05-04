import type { CompanyMemberInvitation } from '../entities/CompanyMemberInvitation.js';

export interface ICompanyMemberInvitationRepository {
  findById(id: string, include?: Record<string, unknown>): Promise<CompanyMemberInvitation | null>;
  findByIdWithDetails(id: string): Promise<CompanyMemberInvitation | null>;
  findByCompanyId(companyId: string, status?: string): Promise<CompanyMemberInvitation[]>;
  findByUserId(userId: string, status?: string): Promise<CompanyMemberInvitation[]>;
  findPendingByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMemberInvitation | null>;
  hasPendingInvitation(userId: string, companyId: string): Promise<boolean>;
  save(invitation: CompanyMemberInvitation): Promise<CompanyMemberInvitation>;
  updateStatus(id: string, status: string): Promise<CompanyMemberInvitation>;
  delete(id: string): Promise<CompanyMemberInvitation>;
}
