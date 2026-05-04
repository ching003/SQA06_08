export const JobStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
