export const CompanyRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  RECRUITER: 'RECRUITER',
} as const;

export type CompanyRole = (typeof CompanyRole)[keyof typeof CompanyRole];
