export interface AchievementProps {
  id?: string;
  cvId: string;
  title: string;
  description?: string | null;
  acquiredAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Achievement {
  readonly id?: string;
  readonly cvId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly acquiredAt?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: AchievementProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.title = props.title;
    this.description = props.description;
    this.acquiredAt = props.acquiredAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<AchievementProps>): Achievement {
    return new Achievement({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      title: props.title ?? this.title,
      description: props.description !== undefined ? props.description : this.description,
      acquiredAt: props.acquiredAt !== undefined ? props.acquiredAt : this.acquiredAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
