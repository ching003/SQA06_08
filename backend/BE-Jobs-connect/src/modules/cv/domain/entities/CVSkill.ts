import type { SkillLevel } from '../enums/SkillLevel.js';

export interface CVSkillProps {
  id?: string;
  cvId: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CVSkill {
  readonly id?: string;
  readonly cvId: string;
  readonly skillName: string;
  readonly level: SkillLevel;
  readonly yearsOfExperience?: number | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CVSkillProps) {
    this.id = props.id;
    this.cvId = props.cvId;
    this.skillName = props.skillName;
    this.level = props.level;
    this.yearsOfExperience = props.yearsOfExperience;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<CVSkillProps>): CVSkill {
    return new CVSkill({
      id: this.id,
      cvId: props.cvId ?? this.cvId,
      skillName: props.skillName ?? this.skillName,
      level: props.level ?? this.level,
      yearsOfExperience: props.yearsOfExperience !== undefined ? props.yearsOfExperience : this.yearsOfExperience,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
