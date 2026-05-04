import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { InvitationStatus } from '../../domain/enums/InvitationStatus.js';
import type { CancelInvitationInputDTO, CancelInvitationOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
  notificationService: INotificationService;
}

export class CancelInvitationUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly invitationRepository: ICompanyMemberInvitationRepository;
  private readonly notificationService: INotificationService;

  constructor({ companyRepository, companyMemberRepository, companyMemberInvitationRepository, notificationService }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.invitationRepository = companyMemberInvitationRepository;
    this.notificationService = notificationService;
  }

  async execute(input: CancelInvitationInputDTO): Promise<CancelInvitationOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Find invitation with details
    const invitation = await this.invitationRepository.findByIdWithDetails(input.invitationId);
    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    // Check invitation belongs to company
    if (invitation.companyId !== input.companyId) {
      throw new NotFoundError('Invitation not found in this company');
    }

    // Check invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessRuleError('Only pending invitations can be cancelled');
    }

    // Check permission: OWNER/MANAGER or the invitee
    const isInvitee = invitation.userId === input.userId;
    let hasPermission = isInvitee;

    if (!isInvitee) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
      if (member) {
        hasPermission = member.companyRole === CompanyRole.OWNER || member.companyRole === CompanyRole.MANAGER;
      }
    }

    if (!hasPermission) {
      throw new AuthorizationError('You do not have permission to cancel this invitation');
    }

    // Mark notification as read if exists (instead of deleting to keep history)
    if (invitation.notificationId) {
      await this.notificationService.markAsRead(invitation.notificationId);
    }

    // Update invitation status to CANCELLED (keep history instead of deleting)
    await this.invitationRepository.updateStatus(input.invitationId, InvitationStatus.CANCELLED);

    return {
      success: true,
      message: 'Hủy lời mời thành công',
    };
  }
}
