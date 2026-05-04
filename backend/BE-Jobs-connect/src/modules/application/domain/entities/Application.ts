import type { ApplicationStatus } from '../enums/ApplicationStatus.js';

// Partial relation types for Application
export interface ApplicationUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface ApplicationCompany {
  id: string;
  name: string;
}

export interface ApplicationJob {
  id: string;
  title: string;
  companyId: string;
  company?: ApplicationCompany;
}

export interface ApplicationCV {
  id: string;
  title: string;
}

export interface ApplicationProps {
  id?: string;
  userId: string;
  jobId: string;
  cvId: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: ApplicationUser;
  job?: ApplicationJob;
  cv?: ApplicationCV;
}

export class Application {
  readonly id?: string;
  readonly userId: string;
  readonly jobId: string;
  readonly cvId: string;
  readonly coverLetter?: string | null;
  readonly status: ApplicationStatus;
  readonly notes?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly user?: ApplicationUser;
  readonly job?: ApplicationJob;
  readonly cv?: ApplicationCV;

  constructor(props: ApplicationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.jobId = props.jobId;
    this.cvId = props.cvId;
    this.coverLetter = props.coverLetter;
    this.status = props.status;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.user = props.user;
    this.job = props.job;
    this.cv = props.cv;
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isActive(): boolean {
    return this.status === 'PENDING' || this.status === 'REVIEWING';
  }

  canBeWithdrawn(): boolean {
    return this.isPending();
  }

  with(props: Partial<ApplicationProps>): Application {
    return new Application({
      id: this.id,
      userId: props.userId ?? this.userId,
      jobId: props.jobId ?? this.jobId,
      cvId: props.cvId ?? this.cvId,
      coverLetter: props.coverLetter !== undefined ? props.coverLetter : this.coverLetter,
      status: props.status ?? this.status,
      notes: props.notes !== undefined ? props.notes : this.notes,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      user: props.user !== undefined ? props.user : this.user,
      job: props.job !== undefined ? props.job : this.job,
      cv: props.cv !== undefined ? props.cv : this.cv,
    });
  }
}
