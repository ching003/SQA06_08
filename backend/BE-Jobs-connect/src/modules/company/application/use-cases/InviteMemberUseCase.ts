import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, ConflictError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { InvitationStatus } from '../../domain/enums/InvitationStatus.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { InviteMemberInputDTO, InviteMemberOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
  userRepository: IUserRepository;
  notificationService: INotificationService;
}

export class InviteMemberUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly invitationRepository: ICompanyMemberInvitationRepository;
  private readonly userRepository: IUserRepository;
  private readonly notificationService: INotificationService;

  constructor({ companyRepository, companyMemberRepository, companyMemberInvitationRepository, userRepository, notificationService }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.invitationRepository = companyMemberInvitationRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async execute(input: InviteMemberInputDTO): Promise<InviteMemberOutputDTO> {
    // Check if company exists and is active
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy công ty');
    }

    if (company.status !== UserStatus.ACTIVE) {
      throw new BusinessRuleError('Không thể mời thành viên vào công ty chưa kích hoạt');
    }

    // Check inviter permission (must be OWNER or MANAGER)
    const inviterMember = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.inviterId);
    if (!inviterMember) {
      throw new AuthorizationError('Bạn không phải là thành viên của công ty này');
    }

    if (inviterMember.companyRole !== CompanyRole.OWNER && inviterMember.companyRole !== CompanyRole.MANAGER) {
      throw new AuthorizationError('Chỉ có chủ sở hữu và quản lý mới có thể mời thành viên');
    }

    const role = input.role || CompanyRole.RECRUITER;

    // Check if manager is trying to invite equal or higher role
    if (inviterMember.companyRole === CompanyRole.MANAGER) {
      if (role === CompanyRole.OWNER || role === CompanyRole.MANAGER) {
        throw new AuthorizationError('Quản lý chỉ có thể mời thành viên với vai trò thấp hơn');
      }
    }

    // Find user by email
    const invitedUser = await this.userRepository.findByEmail(input.email);
    if (!invitedUser) {
      throw new NotFoundError('Không tìm thấy người dùng với email này');
    }

    // Check if user is already a member
    const existingMember = await this.companyMemberRepository.findByUserId(invitedUser.id);
    if (existingMember) {
      throw new ConflictError('Người dùng đã là thành viên của một công ty');
    }

    // Check if there's already a pending invitation
    const pendingInvitation = await this.invitationRepository.hasPendingInvitation(invitedUser.id, input.companyId);
    if (pendingInvitation) {
      throw new ConflictError('Người dùng này đã có một lời mời đang chờ từ công ty này');
    }

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);



    // Create notification first
    const notification = await this.notificationService.createNotification({
      userId: invitedUser.id,
      type: 'COMPANY_INVITATION',
      title: 'Lời mời tham gia công ty',
      message: `Bạn đã được mời tham gia công ty "${company.name}" với vai trò ${role}`,
      data: { companyId: company.id, role },
    });

    // Create invitation
    const invitation = await this.invitationRepository.save({
      companyId: input.companyId,
      userId: invitedUser.id,
      inviterId: input.inviterId,
      role,
      status: InvitationStatus.PENDING,
      expiresAt,
      notificationId: notification.id,
    } as any);

    return {
      invitation: {
        id: invitation.id!,
        companyId: invitation.companyId,
        userId: invitation.userId,
        inviterId: invitation.inviterId,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt!,
      },
      user: {
        id: invitedUser.id,
        email: invitedUser.email,
        fullName: invitedUser.fullName,
      },
      company: {
        id: company.id!,
        name: company.name,
      },
    };
  }
}
