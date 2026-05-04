export interface WorkExperienceProps {
  id?: string;
  cvId: string;
  title: string;
  company: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkExperience {
  readonly id?: string;
  readonly cvId: string;
  readonly title: string;
  readonly company: string;
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: WorkExperienceProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.title = props.title;
    this.company = props.company;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<WorkExperienceProps>): WorkExperience {
    return new WorkExperience({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      title: props.title ?? this.title,
      company: props.company ?? this.company,
      startDate: props.startDate !== undefined ? props.startDate : this.startDate,
      endDate: props.endDate !== undefined ? props.endDate : this.endDate,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
