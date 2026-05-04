export const SkillLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];
