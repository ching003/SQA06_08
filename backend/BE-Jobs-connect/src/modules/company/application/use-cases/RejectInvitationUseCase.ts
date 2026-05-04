import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { InvitationStatus } from '../../domain/enums/InvitationStatus.js';
import type { RejectInvitationInputDTO, RejectInvitationOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
  notificationService: INotificationService;
}

export class RejectInvitationUseCase {
  private readonly invitationRepository: ICompanyMemberInvitationRepository;
  private readonly notificationService: INotificationService;

  constructor({ companyMemberInvitationRepository, notificationService }: Dependencies) {
    this.invitationRepository = companyMemberInvitationRepository;
    this.notificationService = notificationService;
  }

  async execute(input: RejectInvitationInputDTO): Promise<RejectInvitationOutputDTO> {
    // Find invitation with details
    const invitation = await this.invitationRepository.findByIdWithDetails(input.invitationId);
    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    // Check invitation belongs to user
    if (invitation.userId !== input.userId) {
      throw new AuthorizationError('This invitation is not for you');
    }

    // Check invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessRuleError('Lời mời không còn ở trạng thái chờ xử lý');
    }

    // Check invitation is not expired
    if (new Date() > invitation.expiresAt) {
      // Update status to expired
      await this.invitationRepository.updateStatus(input.invitationId, InvitationStatus.EXPIRED);
      throw new BusinessRuleError('Lời mời đã hết hạn');
    }

    // Mark notification as read if exists
    if (invitation.notificationId) {
      await this.notificationService.markAsRead(invitation.notificationId);
    }

    // Update invitation status to REJECTED (keep history)
    await this.invitationRepository.updateStatus(input.invitationId, InvitationStatus.REJECTED);

    // Notify inviter about rejection
    const companyName = invitation.company?.name || 'công ty';
    await this.notificationService.createNotification({
      userId: invitation.inviterId,
      type: 'INVITATION_REJECTED',
      title: 'Lời mời bị từ chối',
      message: `Lời mời tham gia công ty "${companyName}" đã bị từ chối`,
      data: { invitationId: invitation.id, companyId: invitation.companyId },
    });

    return {
      success: true,
      message: 'Từ chối lời mời thành công',
    };
  }
}
