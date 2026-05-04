export interface ReferenceProps {
  id?: string;
  cvId: string;
  name: string;
  position?: string | null;
  company?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Reference {
  readonly id?: string;
  readonly cvId: string;
  readonly name: string;
  readonly position?: string | null;
  readonly company?: string | null;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ReferenceProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.name = props.name;
    this.position = props.position;
    this.company = props.company;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<ReferenceProps>): Reference {
    return new Reference({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      name: props.name ?? this.name,
      position: props.position !== undefined ? props.position : this.position,
      company: props.company !== undefined ? props.company : this.company,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
