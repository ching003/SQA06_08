import type { LanguageLevel } from '../enums/LanguageLevel.js';

export interface LanguageProps {
  id?: string;
  cvId: string;
  name: string;
  level: LanguageLevel;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Language {
  readonly id?: string;
  readonly cvId: string;
  readonly name: string;
  readonly level: LanguageLevel;
  readonly description?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: LanguageProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.name = props.name;
    this.level = props.level;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<LanguageProps>): Language {
    return new Language({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      name: props.name ?? this.name,
      level: props.level ?? this.level,
      description: props.description !== undefined ? props.description : this.description,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
