export const ApplicationStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
