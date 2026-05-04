import type { UserRole } from '../enums/UserRole.js';
import type { UserStatus } from '../enums/UserStatus.js';
import type { Gender } from '../enums/Gender.js';
import type { CompanyMember } from '@modules/company/domain/entities/CompanyMember.js';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogoutAt?: Date | null;
  companyMember?: CompanyMember | null;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly fullName: string | null;
  readonly phoneNumber: string | null;
  readonly avatarUrl: string | null;
  readonly dateOfBirth: Date | null;
  readonly gender: Gender | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLogoutAt: Date | null;
  readonly companyMember?: CompanyMember | null;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.fullName = props.fullName;
    this.phoneNumber = props.phoneNumber;
    this.avatarUrl = props.avatarUrl;
    this.dateOfBirth = props.dateOfBirth;
    this.gender = props.gender;
    this.role = props.role;
    this.status = props.status;
    this.lastLoginAt = props.lastLoginAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastLogoutAt = props.lastLogoutAt ?? null;
    this.companyMember = props.companyMember;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isLocked(): boolean {
    return this.status === 'LOCKED';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isRecruiter(): boolean {
    return this.role === 'RECRUITER';
  }

  isCandidate(): boolean {
    return this.role === 'CANDIDATE';
  }

  canApplyForJob(): boolean {
    return this.isCandidate() && this.isActive();
  }

  canPostJob(): boolean {
    return this.isRecruiter() && this.isActive();
  }

  getAge(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  with(props: Partial<UserProps>): User {
    return new User({
      id: this.id,
      email: props.email ?? this.email,
      passwordHash: props.passwordHash ?? this.passwordHash,
      fullName: props.fullName !== undefined ? props.fullName : this.fullName,
      phoneNumber: props.phoneNumber !== undefined ? props.phoneNumber : this.phoneNumber,
      avatarUrl: props.avatarUrl !== undefined ? props.avatarUrl : this.avatarUrl,
      dateOfBirth: props.dateOfBirth !== undefined ? props.dateOfBirth : this.dateOfBirth,
      gender: props.gender !== undefined ? props.gender : this.gender,
      role: props.role ?? this.role,
      status: props.status ?? this.status,
      lastLoginAt: props.lastLoginAt !== undefined ? props.lastLoginAt : this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      lastLogoutAt: props.lastLogoutAt !== undefined ? props.lastLogoutAt : this.lastLogoutAt,
      companyMember: props.companyMember !== undefined ? props.companyMember : this.companyMember,
    });
  }
}
