import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { ListInvitationsInputDTO, ListInvitationsOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
}

export class ListInvitationsUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly invitationRepository: ICompanyMemberInvitationRepository;

  constructor({ companyRepository, companyMemberRepository, companyMemberInvitationRepository }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.invitationRepository = companyMemberInvitationRepository;
  }

  async execute(input: ListInvitationsInputDTO): Promise<ListInvitationsOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check user permission (must be OWNER or MANAGER)
    const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
    if (!member) {
      throw new AuthorizationError('You are not a member of this company');
    }

    if (member.companyRole !== CompanyRole.OWNER && member.companyRole !== CompanyRole.MANAGER) {
      throw new AuthorizationError('Only owners and managers can view invitations');
    }

    // Get invitations
    const invitations = await this.invitationRepository.findByCompanyId(input.companyId, input.status);

    return {
      invitations: invitations.map((inv) => ({
        id: inv.id!,
        companyId: inv.companyId,
        userId: inv.userId,
        inviterId: inv.inviterId,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        notificationId: inv.notificationId || null,
        createdAt: inv.createdAt!,
        updatedAt: inv.updatedAt!,
        user: inv.user
          ? {
              id: inv.user.id,
              email: inv.user.email,
              fullName: inv.user.fullName,
              avatarUrl: inv.user.avatarUrl,
            }
          : undefined,
        inviter: inv.inviter
          ? {
              id: inv.inviter.id,
              email: inv.inviter.email,
              fullName: inv.inviter.fullName,
              avatarUrl: inv.inviter.avatarUrl,
            }
          : undefined,
        company: inv.company
          ? {
              id: inv.company.id!,
              name: inv.company.name,
              logoUrl: inv.company.logoUrl || null,
            }
          : undefined,
      })),
    };
  }
}
