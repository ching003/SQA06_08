import type { CompanyMember as PrismaCompanyMember, User as PrismaUser, Company as PrismaCompany } from '@prisma/client';
import { CompanyMember } from '../../domain/entities/CompanyMember.js';
import { User } from '@modules/user/domain/entities/User.js';
import { Company } from '../../domain/entities/Company.js';
import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { CompanySize } from '../../domain/enums/CompanySize.js';
import type { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { Gender } from '@modules/user/domain/enums/Gender.js';

type PrismaCompanyMemberWithRelations = PrismaCompanyMember & {
  user?: PrismaUser;
  company?: PrismaCompany;
};

export class CompanyMemberMapper {
  static toDomain(raw: PrismaCompanyMemberWithRelations): CompanyMember {
    return new CompanyMember({
      id: raw.id,
      userId: raw.userId,
      companyId: raw.companyId,
      companyRole: raw.companyRole as CompanyRole,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user
        ? new User({
            id: raw.user.id,
            email: raw.user.email,
            passwordHash: raw.user.passwordHash,
            fullName: raw.user.fullName,
            phoneNumber: raw.user.phoneNumber,
            avatarUrl: raw.user.avatarUrl,
            dateOfBirth: raw.user.dateOfBirth,
            gender: raw.user.gender as Gender | null,
            role: raw.user.role as UserRole,
            status: raw.user.status as UserStatus,
            lastLoginAt: raw.user.lastLoginAt,
            createdAt: raw.user.createdAt,
            updatedAt: raw.user.updatedAt,
          })
        : undefined,
      company: raw.company
        ? new Company({
            id: raw.company.id,
            name: raw.company.name,
            website: raw.company.website,
            description: raw.company.description,
            industry: raw.company.industry,
            companySize: raw.company.companySize as CompanySize | null,
            foundedYear: raw.company.foundedYear,
            address: raw.company.address,
            phone: raw.company.phone,
            email: raw.company.email,
            logoUrl: raw.company.logoUrl,
            bannerUrl: raw.company.bannerUrl,
            status: raw.company.status as UserStatus,
            documentUrl: raw.company.documentUrl,
            createdAt: raw.company.createdAt,
            updatedAt: raw.company.updatedAt,
          })
        : undefined,
    });
  }
}
