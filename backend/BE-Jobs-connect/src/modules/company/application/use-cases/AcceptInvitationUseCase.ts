import type { PrismaClient } from '@prisma/client';
import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import { NotFoundError, AuthorizationError, BusinessRuleError, ConflictError } from '@shared/domain/errors/index.js';
import { InvitationStatus } from '../../domain/enums/InvitationStatus.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { AcceptInvitationInputDTO, AcceptInvitationOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
  notificationService: INotificationService;
  prisma: PrismaClient;
}

export class AcceptInvitationUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly invitationRepository: ICompanyMemberInvitationRepository;
  private readonly notificationService: INotificationService;
  private readonly prisma: PrismaClient;

  constructor({ companyRepository, companyMemberRepository, companyMemberInvitationRepository, notificationService, prisma }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.invitationRepository = companyMemberInvitationRepository;
    this.notificationService = notificationService;
    this.prisma = prisma;
  }

  async execute(input: AcceptInvitationInputDTO): Promise<AcceptInvitationOutputDTO> {
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

    // Check company is active
    const company = await this.companyRepository.findByIdWithoutMembers(invitation.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.status !== UserStatus.ACTIVE) {
      throw new BusinessRuleError('Cannot join an inactive company');
    }

    // Check user is not already a member of any company
    const existingMember = await this.companyMemberRepository.findByUserId(input.userId);
    if (existingMember) {
      throw new ConflictError('You are already a member of a company');
    }

    // Use transaction to ensure atomic operation
    const result = await this.prisma.$transaction(async (tx) => {
      // Double check member doesn't exist (prevent race condition)
      const memberExists = await tx.companyMember.findUnique({
        where: { userId: input.userId },
      });
      if (memberExists) {
        throw new ConflictError('You are already a member of a company');
      }

      // Check invitation is not expired (inside transaction for atomicity)
      if (new Date() > invitation.expiresAt) {
        // Update status to expired
        await tx.companyMemberInvitation.update({
          where: { id: input.invitationId },
          data: { status: InvitationStatus.EXPIRED },
        });
        throw new BusinessRuleError('Lời mời đã hết hạn');
      }

      // Create company member
      const member = await tx.companyMember.create({
        data: {
          userId: input.userId,
          companyId: invitation.companyId,
          companyRole: invitation.role,
        },
      });

      // Mark notification as read
      if (invitation.notificationId) {
        await tx.notification.update({
          where: { id: invitation.notificationId },
          data: { isRead: true },
        });
      }

      // Update invitation status
      await tx.companyMemberInvitation.update({
        where: { id: input.invitationId },
        data: { status: 'ACCEPTED' },
      });

      // Update user role to RECRUITER if not already
      const user = await tx.user.findUnique({
        where: { id: input.userId },
      });

      if (user && user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
        await tx.user.update({
          where: { id: input.userId },
          data: { role: 'RECRUITER' },
        });
      }

      return member;
    });

    // Notify OWNER and MANAGER members about new member
    const managers = await this.companyMemberRepository.findByRole(invitation.companyId, CompanyRole.OWNER);
    const allManagers = [
      ...managers,
      ...(await this.companyMemberRepository.findByRole(invitation.companyId, CompanyRole.MANAGER)),
    ];

    for (const manager of allManagers) {
      if (manager.userId !== input.userId) {
        await this.notificationService.createNotification({
          userId: manager.userId,
          type: 'MEMBER_JOINED',
          title: 'Thành viên mới tham gia',
          message: `Một thành viên mới đã tham gia công ty "${company.name}" với vai trò ${invitation.role}`,
          data: { companyId: company.id, memberId: result.id },
        });
      }
    }

    return {
      member: {
        id: result.id,
        userId: result.userId,
        companyId: result.companyId,
        companyRole: result.companyRole as CompanyRole,
        createdAt: result.createdAt,
      },
      company: {
        id: company.id!,
        name: company.name,
        logoUrl: company.logoUrl || null,
      },
    };
  }
}
