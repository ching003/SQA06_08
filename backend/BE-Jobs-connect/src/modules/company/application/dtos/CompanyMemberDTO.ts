import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';

// ============ Member List DTOs ============

export interface ListMembersInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
}

export interface MemberUserDTO {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
}

export interface MemberOutputDTO {
  id: string;
  userId: string;
  companyId: string;
  companyRole: CompanyRole;
  createdAt: Date;
  updatedAt: Date;
  user?: MemberUserDTO;
}

export interface ListMembersOutputDTO {
  members: MemberOutputDTO[];
}

// ============ Invite Member DTOs ============

export interface InviteMemberInputDTO {
  companyId: string;
  inviterId: string;
  inviterRole?: string;
  email: string;
  role?: CompanyRole;
}

export interface InviteMemberOutputDTO {
  invitation: {
    id: string;
    companyId: string;
    userId: string;
    inviterId: string;
    role: CompanyRole;
    status: string;
    expiresAt: Date;
    createdAt: Date;
  };
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  company: {
    id: string;
    name: string;
  };
}

// ============ Update Member Role DTOs ============

export interface UpdateMemberRoleInputDTO {
  companyId: string;
  memberId: string;
  userId: string;
  userRole?: string;
  newRole: CompanyRole;
}

export interface UpdateMemberRoleOutputDTO extends MemberOutputDTO {}

// ============ Delete Member DTOs ============

export interface DeleteMemberInputDTO {
  companyId: string;
  memberId: string;
  userId: string;
  userRole?: string;
}

export interface DeleteMemberOutputDTO {
  success: boolean;
  message: string;
}
