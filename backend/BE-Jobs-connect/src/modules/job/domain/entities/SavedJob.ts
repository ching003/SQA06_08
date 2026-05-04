import type { User } from '@modules/user/domain/entities/User.js';
import type { Job } from './Job.js';

export interface SavedJobProps {
  id?: string;
  userId: string;
  jobId: string;
  createdAt?: Date;
  user?: User;
  job?: Job;
}

export class SavedJob {
  readonly id?: string;
  readonly userId: string;
  readonly jobId: string;
  readonly createdAt?: Date;
  readonly user?: User;
  readonly job?: Job;

  constructor(props: SavedJobProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.jobId = props.jobId;
    this.createdAt = props.createdAt;
    this.user = props.user;
    this.job = props.job;
  }
}
