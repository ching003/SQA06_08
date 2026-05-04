export interface CertificationProps {
  id?: string;
  cvId: string;
  name: string;
  issuer?: string | null;
  acquiredAt?: Date | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Certification {
  readonly id?: string;
  readonly cvId: string;
  readonly name: string;
  readonly issuer?: string | null;
  readonly acquiredAt?: Date | null;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CertificationProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.name = props.name;
    this.issuer = props.issuer;
    this.acquiredAt = props.acquiredAt;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<CertificationProps>): Certification {
    return new Certification({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      name: props.name ?? this.name,
      issuer: props.issuer !== undefined ? props.issuer : this.issuer,
      acquiredAt: props.acquiredAt !== undefined ? props.acquiredAt : this.acquiredAt,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
