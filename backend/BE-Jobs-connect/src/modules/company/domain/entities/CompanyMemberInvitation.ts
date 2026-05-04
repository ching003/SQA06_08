import type { CompanyRole } from '../enums/CompanyRole.js';
import type { InvitationStatus } from '../enums/InvitationStatus.js';
import type { User } from '@modules/user/domain/entities/User.js';
import type { Company } from './Company.js';

export interface CompanyMemberInvitationProps {
  id?: string;
  companyId: string;
  userId: string;
  inviterId: string;
  role: CompanyRole;
  status: InvitationStatus;
  expiresAt: Date;
  notificationId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  company?: Company;
  user?: User;
  inviter?: User;
}

export class CompanyMemberInvitation {
  readonly id?: string;
  readonly companyId: string;
  readonly userId: string;
  readonly inviterId: string;
  readonly role: CompanyRole;
  readonly status: InvitationStatus;
  readonly expiresAt: Date;
  readonly notificationId?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly company?: Company;
  readonly user?: User;
  readonly inviter?: User;

  constructor(props: CompanyMemberInvitationProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.userId = props.userId;
    this.inviterId = props.inviterId;
    this.role = props.role;
    this.status = props.status;
    this.expiresAt = props.expiresAt;
    this.notificationId = props.notificationId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.company = props.company;
    this.user = props.user;
    this.inviter = props.inviter;
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canBeAccepted(): boolean {
    return this.isPending() && !this.isExpired();
  }

  with(props: Partial<CompanyMemberInvitationProps>): CompanyMemberInvitation {
    return new CompanyMemberInvitation({
      id: this.id,
      companyId: props.companyId ?? this.companyId,
      userId: props.userId ?? this.userId,
      inviterId: props.inviterId ?? this.inviterId,
      role: props.role ?? this.role,
      status: props.status ?? this.status,
      expiresAt: props.expiresAt ?? this.expiresAt,
      notificationId: props.notificationId !== undefined ? props.notificationId : this.notificationId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      company: props.company !== undefined ? props.company : this.company,
      user: props.user !== undefined ? props.user : this.user,
      inviter: props.inviter !== undefined ? props.inviter : this.inviter,
    });
  }
}
