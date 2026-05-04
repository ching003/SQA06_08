export const CompanySize = {
  STARTUP: 'STARTUP',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];
