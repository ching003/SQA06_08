export interface ProjectProps {
  id?: string;
  cvId: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  url?: string | null;
  role?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  readonly id?: string;
  readonly cvId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
  readonly url?: string | null;
  readonly role?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.name = props.name;
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.url = props.url;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<ProjectProps>): Project {
    return new Project({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      name: props.name ?? this.name,
      description: props.description !== undefined ? props.description : this.description,
      startDate: props.startDate !== undefined ? props.startDate : this.startDate,
      endDate: props.endDate !== undefined ? props.endDate : this.endDate,
      url: props.url !== undefined ? props.url : this.url,
      role: props.role !== undefined ? props.role : this.role,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
