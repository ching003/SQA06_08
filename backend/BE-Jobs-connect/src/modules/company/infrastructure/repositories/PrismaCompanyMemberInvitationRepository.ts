import type { PrismaClient, CompanyRole as PrismaCompanyRole, InvitationStatus as PrismaInvitationStatus } from '@prisma/client';
import type { ICompanyMemberInvitationRepository } from '../../domain/repositories/ICompanyMemberInvitationRepository.js';
import { CompanyMemberInvitation } from '../../domain/entities/CompanyMemberInvitation.js';
import { CompanyMemberInvitationMapper } from '../mappers/CompanyMemberInvitationMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaCompanyMemberInvitationRepository implements ICompanyMemberInvitationRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<CompanyMemberInvitation | null> {
    const invitation = await this.prisma.companyMemberInvitation.findUnique({
      where: { id },
      include: include as any,
    });

    if (!invitation) return null;
    return CompanyMemberInvitationMapper.toDomain(invitation);
  }

  async findByIdWithDetails(id: string): Promise<CompanyMemberInvitation | null> {
    const invitation = await this.prisma.companyMemberInvitation.findUnique({
      where: { id },
      include: {
        company: true,
        user: true,
        inviter: true,
      },
    });

    if (!invitation) return null;
    return CompanyMemberInvitationMapper.toDomain(invitation);
  }

  async findByCompanyId(companyId: string, status?: string): Promise<CompanyMemberInvitation[]> {
    const where: Record<string, unknown> = { companyId };
    if (status) {
      where.status = status as PrismaInvitationStatus;
    }

    const invitations = await this.prisma.companyMemberInvitation.findMany({
      where,
      include: {
        company: true,
        user: true,
        inviter: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((i) => CompanyMemberInvitationMapper.toDomain(i));
  }

  async findByUserId(userId: string, status?: string): Promise<CompanyMemberInvitation[]> {
    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status as PrismaInvitationStatus;
    }

    const invitations = await this.prisma.companyMemberInvitation.findMany({
      where,
      include: {
        company: true,
        user: true,
        inviter: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((i) => CompanyMemberInvitationMapper.toDomain(i));
  }

  async findPendingByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMemberInvitation | null> {
    const invitation = await this.prisma.companyMemberInvitation.findFirst({
      where: {
        companyId,
        userId,
        status: 'PENDING',
      },
      include: {
        company: true,
        user: true,
        inviter: true,
      },
    });

    if (!invitation) return null;
    return CompanyMemberInvitationMapper.toDomain(invitation);
  }

  async hasPendingInvitation(userId: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.companyMemberInvitation.count({
      where: {
        userId,
        companyId,
        status: 'PENDING',
      },
    });
    return count > 0;
  }

  async save(invitation: CompanyMemberInvitation | Record<string, unknown>): Promise<CompanyMemberInvitation> {
    const data = invitation instanceof CompanyMemberInvitation ? invitation : invitation;

    const created = await this.prisma.companyMemberInvitation.create({
      data: {
        companyId: data.companyId as string,
        userId: data.userId as string,
        inviterId: data.inviterId as string,
        role: data.role as PrismaCompanyRole,
        status: (data.status as PrismaInvitationStatus) || 'PENDING',
        expiresAt: data.expiresAt as Date,
        notificationId: data.notificationId as string | null | undefined,
      },
      include: {
        company: true,
        user: true,
        inviter: true,
      },
    });

    return CompanyMemberInvitationMapper.toDomain(created);
  }

  async updateStatus(id: string, status: string): Promise<CompanyMemberInvitation> {
    const updated = await this.prisma.companyMemberInvitation.update({
      where: { id },
      data: { status: status as PrismaInvitationStatus },
      include: {
        company: true,
        user: true,
        inviter: true,
      },
    });

    return CompanyMemberInvitationMapper.toDomain(updated);
  }

  async delete(id: string): Promise<CompanyMemberInvitation> {
    const deleted = await this.prisma.companyMemberInvitation.delete({
      where: { id },
    });

    return CompanyMemberInvitationMapper.toDomain(deleted);
  }
}
