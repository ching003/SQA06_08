export const ExperienceLevel = {
  INTERN: 'INTERN',
  FRESHER: 'FRESHER',
  JUNIOR: 'JUNIOR',
  MIDDLE: 'MIDDLE',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  MANAGER: 'MANAGER',
} as const;

export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];
