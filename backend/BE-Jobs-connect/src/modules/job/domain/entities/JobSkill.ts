import type { SkillLevel } from '@modules/cv/domain/enums/SkillLevel.js';

export interface JobSkillProps {
  id?: string;
  jobId: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class JobSkill {
  readonly id?: string;
  readonly jobId: string;
  readonly skillName: string;
  readonly level: SkillLevel;
  readonly yearsOfExperience?: number | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: JobSkillProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.skillName = props.skillName;
    this.level = props.level;
    this.yearsOfExperience = props.yearsOfExperience;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<JobSkillProps>): JobSkill {
    return new JobSkill({
      id: this.id,
      jobId: props.jobId ?? this.jobId,
      skillName: props.skillName ?? this.skillName,
      level: props.level ?? this.level,
      yearsOfExperience: props.yearsOfExperience !== undefined ? props.yearsOfExperience : this.yearsOfExperience,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}

