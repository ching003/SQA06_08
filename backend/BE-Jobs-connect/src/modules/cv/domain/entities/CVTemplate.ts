export interface CVTemplateProps {
  id?: string;
  name: string;
  description?: string | null;
  htmlUrl: string;
  previewUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CVTemplate {
  readonly id?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly htmlUrl: string;
  readonly previewUrl?: string | null;
  readonly isActive: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CVTemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.htmlUrl = props.htmlUrl;
    this.previewUrl = props.previewUrl;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<CVTemplateProps>): CVTemplate {
    return new CVTemplate({
      id: this.id,
      name: props.name ?? this.name,
      description: props.description !== undefined ? props.description : this.description,
      htmlUrl: props.htmlUrl ?? this.htmlUrl,
      previewUrl: props.previewUrl !== undefined ? props.previewUrl : this.previewUrl,
      isActive: props.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
