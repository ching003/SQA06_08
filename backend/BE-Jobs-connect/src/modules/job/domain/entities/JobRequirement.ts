export interface JobRequirementProps {
  id?: string;
  jobId: string;
  title: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class JobRequirement {
  readonly id?: string;
  readonly jobId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: JobRequirementProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.title = props.title;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<JobRequirementProps>): JobRequirement {
    return new JobRequirement({
      id: this.id,
      jobId: props.jobId ?? this.jobId,
      title: props.title ?? this.title,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
