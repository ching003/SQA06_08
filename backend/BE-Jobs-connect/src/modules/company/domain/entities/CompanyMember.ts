import type { CompanyRole } from '../enums/CompanyRole.js';
import type { User } from '@modules/user/domain/entities/User.js';
import type { Company } from './Company.js';

export interface CompanyMemberProps {
  id?: string;
  userId: string;
  companyId: string;
  companyRole: CompanyRole;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  company?: Company;
}

export class CompanyMember {
  readonly id?: string;
  readonly userId: string;
  readonly companyId: string;
  readonly companyRole: CompanyRole;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly user?: User;
  readonly company?: Company;

  constructor(props: CompanyMemberProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.companyId = props.companyId;
    this.companyRole = props.companyRole;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.user = props.user;
    this.company = props.company;
  }

  isOwner(): boolean {
    return this.companyRole === 'OWNER';
  }

  isManager(): boolean {
    return this.companyRole === 'MANAGER';
  }

  isRecruiter(): boolean {
    return this.companyRole === 'RECRUITER';
  }

  canManageMembers(): boolean {
    return this.isOwner() || this.isManager();
  }

  with(props: Partial<CompanyMemberProps>): CompanyMember {
    return new CompanyMember({
      id: this.id,
      userId: props.userId ?? this.userId,
      companyId: props.companyId ?? this.companyId,
      companyRole: props.companyRole ?? this.companyRole,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      user: props.user !== undefined ? props.user : this.user,
      company: props.company !== undefined ? props.company : this.company,
    });
  }
}
