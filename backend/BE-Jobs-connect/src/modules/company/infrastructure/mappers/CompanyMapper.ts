import type { Company as PrismaCompany, CompanyMember as PrismaCompanyMember, User as PrismaUser } from '@prisma/client';
import { Company } from '../../domain/entities/Company.js';
import { CompanyMember } from '../../domain/entities/CompanyMember.js';
import { User } from '@modules/user/domain/entities/User.js';
import type { CompanySize } from '../../domain/enums/CompanySize.js';
import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { Gender } from '@modules/user/domain/enums/Gender.js';

type PrismaCompanyWithMembers = PrismaCompany & {
  members?: (PrismaCompanyMember & { user?: PrismaUser })[];
};

export class CompanyMapper {
  static toDomain(raw: PrismaCompany): Company {
    return new Company({
      id: raw.id,
      name: raw.name,
      website: raw.website,
      description: raw.description,
      industry: raw.industry,
      companySize: raw.companySize as CompanySize | null,
      foundedYear: raw.foundedYear,
      address: raw.address,
      phone: raw.phone,
      email: raw.email,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      status: raw.status as UserStatus,
      documentUrl: raw.documentUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainWithMembers(raw: PrismaCompanyWithMembers): Company {
    const members = raw.members?.map((m) => {
      const member = new CompanyMember({
        id: m.id,
        userId: m.userId,
        companyId: m.companyId,
        companyRole: m.companyRole as CompanyRole,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        user: m.user
          ? new User({
              id: m.user.id,
              email: m.user.email,
              passwordHash: m.user.passwordHash,
              fullName: m.user.fullName,
              phoneNumber: m.user.phoneNumber,
              avatarUrl: m.user.avatarUrl,
              dateOfBirth: m.user.dateOfBirth,
              gender: m.user.gender as Gender | null,
              role: m.user.role as UserRole,
              status: m.user.status as UserStatus,
              lastLoginAt: m.user.lastLoginAt,
              createdAt: m.user.createdAt,
              updatedAt: m.user.updatedAt,
            })
          : undefined,
      });
      return member;
    });

    return new Company({
      id: raw.id,
      name: raw.name,
      website: raw.website,
      description: raw.description,
      industry: raw.industry,
      companySize: raw.companySize as CompanySize | null,
      foundedYear: raw.foundedYear,
      address: raw.address,
      phone: raw.phone,
      email: raw.email,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      status: raw.status as UserStatus,
      documentUrl: raw.documentUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      members,
    });
  }
}
