import type { PrismaClient, CompanyRole as PrismaCompanyRole } from '@prisma/client';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import { CompanyMember } from '../../domain/entities/CompanyMember.js';
import { CompanyMemberMapper } from '../mappers/CompanyMemberMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaCompanyMemberRepository implements ICompanyMemberRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<CompanyMember | null> {
    const member = await this.prisma.companyMember.findUnique({
      where: { id },
      include: include as any,
    });

    if (!member) return null;
    return CompanyMemberMapper.toDomain(member);
  }

  async findByUserId(userId: string, include?: Record<string, unknown>): Promise<CompanyMember | null> {
    const member = await this.prisma.companyMember.findUnique({
      where: { userId },
      include: include as any,
    });

    if (!member) return null;
    return CompanyMemberMapper.toDomain(member);
  }

  async findByCompanyId(companyId: string, include?: Record<string, unknown>): Promise<CompanyMember[]> {
    const members = await this.prisma.companyMember.findMany({
      where: { companyId },
      include: include as any,
    });

    return members.map((m) => CompanyMemberMapper.toDomain(m));
  }

  async findByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMember | null> {
    const member = await this.prisma.companyMember.findFirst({
      where: { companyId, userId },
      include: { user: true, company: true },
    });

    if (!member) return null;
    return CompanyMemberMapper.toDomain(member);
  }

  async findByRole(companyId: string, role: string): Promise<CompanyMember[]> {
    const members = await this.prisma.companyMember.findMany({
      where: {
        companyId,
        companyRole: role as PrismaCompanyRole,
      },
      include: { user: true },
    });

    return members.map((m) => CompanyMemberMapper.toDomain(m));
  }

  async userIsMember(userId: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.companyMember.count({
      where: { userId, companyId },
    });
    return count > 0;
  }

  async save(member: CompanyMember | Record<string, unknown>): Promise<CompanyMember> {
    const data = member instanceof CompanyMember ? member : member;

    const created = await this.prisma.companyMember.create({
      data: {
        userId: data.userId as string,
        companyId: data.companyId as string,
        companyRole: data.companyRole as PrismaCompanyRole,
      },
      include: { user: true, company: true },
    });

    return CompanyMemberMapper.toDomain(created);
  }

  async update(id: string, data: Partial<CompanyMember> | Record<string, unknown>): Promise<CompanyMember> {
    const updateData: Record<string, unknown> = {};

    if ('companyRole' in data && data.companyRole !== undefined) {
      updateData.companyRole = data.companyRole as PrismaCompanyRole;
    }

    const updated = await this.prisma.companyMember.update({
      where: { id },
      data: updateData,
      include: { user: true, company: true },
    });

    return CompanyMemberMapper.toDomain(updated);
  }

  async delete(id: string): Promise<CompanyMember> {
    const deleted = await this.prisma.companyMember.delete({
      where: { id },
      include: { user: true, company: true },
    });

    return CompanyMemberMapper.toDomain(deleted);
  }

  async countByCompanyId(companyId: string): Promise<number> {
    return this.prisma.companyMember.count({
      where: { companyId },
    });
  }
}
