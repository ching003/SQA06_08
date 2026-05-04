export interface EducationProps {
  id?: string;
  cvId: string;
  institution: string;
  degree?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Education {
  readonly id?: string;
  readonly cvId: string;
  readonly institution: string;
  readonly degree?: string | null;
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: EducationProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.institution = props.institution;
    this.degree = props.degree;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<EducationProps>): Education {
    return new Education({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      institution: props.institution ?? this.institution,
      degree: props.degree !== undefined ? props.degree : this.degree,
      startDate: props.startDate !== undefined ? props.startDate : this.startDate,
      endDate: props.endDate !== undefined ? props.endDate : this.endDate,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
