import type { CompanySize } from '../enums/CompanySize.js';
import type { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import type { CompanyMember } from './CompanyMember.js';

export interface CompanyProps {
  id?: string;
  name: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: CompanySize | null;
  foundedYear?: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  documentUrl?: string | null;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  members?: CompanyMember[];
}

export class Company {
  readonly id?: string;
  readonly name: string;
  readonly website?: string | null;
  readonly description?: string | null;
  readonly industry?: string | null;
  readonly companySize?: CompanySize | null;
  readonly foundedYear?: number | null;
  readonly address?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly logoUrl?: string | null;
  readonly bannerUrl?: string | null;
  readonly documentUrl?: string | null;
  readonly status: UserStatus;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly members?: CompanyMember[];

  constructor(props: CompanyProps) {
    this.id = props.id;
    this.name = props.name;
    this.website = props.website;
    this.description = props.description;
    this.industry = props.industry;
    this.companySize = props.companySize;
    this.foundedYear = props.foundedYear;
    this.address = props.address;
    this.phone = props.phone;
    this.email = props.email;
    this.logoUrl = props.logoUrl;
    this.bannerUrl = props.bannerUrl;
    this.documentUrl = props.documentUrl;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.members = props.members;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  with(props: Partial<CompanyProps>): Company {
    return new Company({
      id: this.id,
      name: props.name ?? this.name,
      website: props.website !== undefined ? props.website : this.website,
      description: props.description !== undefined ? props.description : this.description,
      industry: props.industry !== undefined ? props.industry : this.industry,
      companySize: props.companySize !== undefined ? props.companySize : this.companySize,
      foundedYear: props.foundedYear !== undefined ? props.foundedYear : this.foundedYear,
      address: props.address !== undefined ? props.address : this.address,
      phone: props.phone !== undefined ? props.phone : this.phone,
      email: props.email !== undefined ? props.email : this.email,
      logoUrl: props.logoUrl !== undefined ? props.logoUrl : this.logoUrl,
      bannerUrl: props.bannerUrl !== undefined ? props.bannerUrl : this.bannerUrl,
      documentUrl: props.documentUrl !== undefined ? props.documentUrl : this.documentUrl,
      status: props.status ?? this.status,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      members: props.members !== undefined ? props.members : this.members,
    });
  }
}
