import type {
  CompanyMemberInvitation as PrismaInvitation,
  User as PrismaUser,
  Company as PrismaCompany,
} from '@prisma/client';
import { CompanyMemberInvitation } from '../../domain/entities/CompanyMemberInvitation.js';
import { User } from '@modules/user/domain/entities/User.js';
import { Company } from '../../domain/entities/Company.js';
import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { InvitationStatus } from '../../domain/enums/InvitationStatus.js';
import type { CompanySize } from '../../domain/enums/CompanySize.js';
import type { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { Gender } from '@modules/user/domain/enums/Gender.js';

type PrismaInvitationWithRelations = PrismaInvitation & {
  user?: PrismaUser;
  inviter?: PrismaUser;
  company?: PrismaCompany;
};

export class CompanyMemberInvitationMapper {
  static toDomain(raw: PrismaInvitationWithRelations): CompanyMemberInvitation {
    return new CompanyMemberInvitation({
      id: raw.id,
      companyId: raw.companyId,
      userId: raw.userId,
      inviterId: raw.inviterId,
      role: raw.role as CompanyRole,
      status: raw.status as InvitationStatus,
      expiresAt: raw.expiresAt || new Date(),
      notificationId: raw.notificationId,
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
      inviter: raw.inviter
        ? new User({
            id: raw.inviter.id,
            email: raw.inviter.email,
            passwordHash: raw.inviter.passwordHash,
            fullName: raw.inviter.fullName,
            phoneNumber: raw.inviter.phoneNumber,
            avatarUrl: raw.inviter.avatarUrl,
            dateOfBirth: raw.inviter.dateOfBirth,
            gender: raw.inviter.gender as Gender | null,
            role: raw.inviter.role as UserRole,
            status: raw.inviter.status as UserStatus,
            lastLoginAt: raw.inviter.lastLoginAt,
            createdAt: raw.inviter.createdAt,
            updatedAt: raw.inviter.updatedAt,
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
