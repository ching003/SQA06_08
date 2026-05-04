export const LanguageLevel = {
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  NATIVE: 'NATIVE',
} as const;

export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];
