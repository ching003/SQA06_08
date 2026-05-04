import { User } from '../../domain/entities/User.js';
import type { User as PrismaUser, CompanyMember as PrismaCompanyMember, Company as PrismaCompany } from '@prisma/client';
import type { UserRole } from '../../domain/enums/UserRole.js';
import type { UserStatus } from '../../domain/enums/UserStatus.js';
import type { Gender } from '../../domain/enums/Gender.js';
import { CompanyMember } from '@modules/company/domain/entities/CompanyMember.js';
import { Company } from '@modules/company/domain/entities/Company.js';
import type { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import type { CompanySize } from '@modules/company/domain/enums/CompanySize.js';

type PrismaUserWithRelations = PrismaUser & {
  companyMember?: (PrismaCompanyMember & {
    company?: PrismaCompany;
  }) | null;
};

export class UserMapper {
  static toDomain(raw: PrismaUserWithRelations): User {
    let companyMember: CompanyMember | null = null;

    if (raw.companyMember) {
      let company: Company | undefined;
      if (raw.companyMember.company) {
        company = new Company({
          id: raw.companyMember.company.id,
          name: raw.companyMember.company.name,
          website: raw.companyMember.company.website,
          description: raw.companyMember.company.description,
          industry: raw.companyMember.company.industry,
          companySize: raw.companyMember.company.companySize as CompanySize | null,
          foundedYear: raw.companyMember.company.foundedYear,
          address: raw.companyMember.company.address,
          phone: raw.companyMember.company.phone,
          email: raw.companyMember.company.email,
          logoUrl: raw.companyMember.company.logoUrl,
          bannerUrl: raw.companyMember.company.bannerUrl,
          documentUrl: raw.companyMember.company.documentUrl,
          status: raw.companyMember.company.status as UserStatus,
          createdAt: raw.companyMember.company.createdAt,
          updatedAt: raw.companyMember.company.updatedAt,
        });
      }

      companyMember = new CompanyMember({
        id: raw.companyMember.id,
        userId: raw.companyMember.userId,
        companyId: raw.companyMember.companyId,
        companyRole: raw.companyMember.companyRole as CompanyRole,
        createdAt: raw.companyMember.createdAt,
        updatedAt: raw.companyMember.updatedAt,
        company,
      });
    }

    return new User({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      fullName: raw.fullName,
      phoneNumber: raw.phoneNumber,
      avatarUrl: raw.avatarUrl,
      dateOfBirth: raw.dateOfBirth,
      gender: raw.gender as Gender | null,
      role: raw.role as UserRole,
      status: raw.status as UserStatus,
      lastLoginAt: raw.lastLoginAt,
      lastLogoutAt: raw.lastLogoutAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      companyMember,
    });
  }

  static toUpdateData(data: Partial<User>): Record<string, unknown> {
    const updateData: Record<string, unknown> = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;
    if (data.lastLogoutAt !== undefined) updateData.lastLogoutAt = data.lastLogoutAt;

    return updateData;
  }
}
