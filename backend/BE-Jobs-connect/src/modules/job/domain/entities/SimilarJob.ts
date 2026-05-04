import type { Job } from './Job.js';

export interface SimilarJobProps {
  id?: string;
  jobId: string;
  similarJobId: string;
  similarity: number;
  createdAt?: Date;
  updatedAt?: Date;
  job?: Job;
  similarJob?: Job;
}

export class SimilarJob {
  readonly id?: string;
  readonly jobId: string;
  readonly similarJobId: string;
  readonly similarity: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly job?: Job;
  readonly similarJob?: Job;

  constructor(props: SimilarJobProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.similarJobId = props.similarJobId;
    this.similarity = props.similarity;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.job = props.job;
    this.similarJob = props.similarJob;
  }

  with(props: Partial<SimilarJobProps>): SimilarJob {
    return new SimilarJob({
      id: this.id,
      jobId: props.jobId ?? this.jobId,
      similarJobId: props.similarJobId ?? this.similarJobId,
      similarity: props.similarity ?? this.similarity,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      job: props.job !== undefined ? props.job : this.job,
      similarJob: props.similarJob !== undefined ? props.similarJob : this.similarJob,
    });
  }
}
