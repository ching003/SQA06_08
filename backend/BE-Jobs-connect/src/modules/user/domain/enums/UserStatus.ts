export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
