import type { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { InvitationStatus } from '../../domain/enums/InvitationStatus.js';

// ============ List Invitations DTOs ============

export interface ListInvitationsInputDTO {
  companyId: string;
  userId: string;
  userRole?: string;
  status?: InvitationStatus;
}

export interface InvitationUserDTO {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface InvitationOutputDTO {
  id: string;
  companyId: string;
  userId: string;
  inviterId: string;
  role: CompanyRole;
  status: InvitationStatus;
  expiresAt: Date;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: InvitationUserDTO;
  inviter?: InvitationUserDTO;
  company?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export interface ListInvitationsOutputDTO {
  invitations: InvitationOutputDTO[];
}

// ============ Cancel Invitation DTOs ============

export interface CancelInvitationInputDTO {
  companyId: string;
  invitationId: string;
  userId: string;
  userRole?: string;
}

export interface CancelInvitationOutputDTO {
  success: boolean;
  message: string;
}

// ============ Accept Invitation DTOs ============

export interface AcceptInvitationInputDTO {
  invitationId: string;
  userId: string;
}

export interface AcceptInvitationOutputDTO {
  member: {
    id: string;
    userId: string;
    companyId: string;
    companyRole: CompanyRole;
    createdAt: Date;
  };
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

// ============ Reject Invitation DTOs ============

export interface RejectInvitationInputDTO {
  invitationId: string;
  userId: string;
}

export interface RejectInvitationOutputDTO {
  success: boolean;
  message: string;
}
