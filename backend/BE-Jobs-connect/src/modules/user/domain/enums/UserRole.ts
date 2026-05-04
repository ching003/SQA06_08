export const UserRole = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
