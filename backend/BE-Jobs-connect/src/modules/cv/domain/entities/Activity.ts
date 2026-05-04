export interface ActivityProps {
  id?: string;
  cvId: string;
  title: string;
  organization?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Activity {
  readonly id?: string;
  readonly cvId: string;
  readonly title: string;
  readonly organization?: string | null;
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ActivityProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.title = props.title;
    this.organization = props.organization;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<ActivityProps>): Activity {
    return new Activity({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      title: props.title ?? this.title,
      organization: props.organization !== undefined ? props.organization : this.organization,
      startDate: props.startDate !== undefined ? props.startDate : this.startDate,
      endDate: props.endDate !== undefined ? props.endDate : this.endDate,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
