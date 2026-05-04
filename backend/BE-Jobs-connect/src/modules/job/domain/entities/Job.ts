import type { JobType } from '../enums/JobType.js';
import type { JobStatus } from '../enums/JobStatus.js';
import type { ExperienceLevel } from '../enums/ExperienceLevel.js';
import type { Company } from '@modules/company/domain/entities/Company.js';
import type { Salary } from './Salary.js';
import type { JobBenefit } from './JobBenefit.js';
import type { JobRequirement } from './JobRequirement.js';
import type { JobSkill } from './JobSkill.js';

export interface JobProps {
  id?: string;
  companyId: string;
  title: string;
  description: string;
  location?: string | null;
  industry?: string | null;
  jobType?: JobType | null;
  experienceLevel?: ExperienceLevel | null;
  urgent?: boolean;
  status: JobStatus;
  applicationCount: number;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  company?: Company;
  salary?: Salary | null;
  skills?: JobSkill[];
  benefits?: JobBenefit[];
  requirements?: JobRequirement[];
}

export class Job {
  readonly id?: string;
  readonly companyId: string;
  readonly title: string;
  readonly description: string;
  readonly location?: string | null;
  readonly industry?: string | null;
  readonly jobType?: JobType | null;
  readonly experienceLevel?: ExperienceLevel | null;
  readonly urgent: boolean;
  readonly status: JobStatus;
  readonly applicationCount: number;
  readonly expiresAt?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly company?: Company;
  readonly salary?: Salary | null;
  readonly skills: JobSkill[];
  readonly benefits: JobBenefit[];
  readonly requirements: JobRequirement[];

  constructor(props: JobProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this.location = props.location;
    this.industry = props.industry;
    this.jobType = props.jobType;
    this.experienceLevel = props.experienceLevel;
    this.urgent = props.urgent ?? false;
    this.status = props.status;
    this.applicationCount = props.applicationCount;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.company = props.company;
    this.salary = props.salary;
    this.skills = props.skills ?? [];
    this.benefits = props.benefits ?? [];
    this.requirements = props.requirements ?? [];
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isLocked(): boolean {
    return this.status === 'LOCKED';
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  canAcceptApplications(): boolean {
    return this.isActive() && !this.isExpired() && !this.isLocked();
  }

  with(props: Partial<JobProps>): Job {
    return new Job({
      id: this.id,
      companyId: props.companyId ?? this.companyId,
      title: props.title ?? this.title,
      description: props.description ?? this.description,
      location: props.location !== undefined ? props.location : this.location,
      industry: props.industry !== undefined ? props.industry : this.industry,
      jobType: props.jobType !== undefined ? props.jobType : this.jobType,
      experienceLevel: props.experienceLevel !== undefined ? props.experienceLevel : this.experienceLevel,
      urgent: props.urgent ?? this.urgent,
      status: props.status ?? this.status,
      applicationCount: props.applicationCount ?? this.applicationCount,
      expiresAt: props.expiresAt !== undefined ? props.expiresAt : this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      company: props.company !== undefined ? props.company : this.company,
      salary: props.salary !== undefined ? props.salary : this.salary,
      skills: props.skills !== undefined ? props.skills : this.skills,
      benefits: props.benefits !== undefined ? props.benefits : this.benefits,
      requirements: props.requirements !== undefined ? props.requirements : this.requirements,
    });
  }
}
