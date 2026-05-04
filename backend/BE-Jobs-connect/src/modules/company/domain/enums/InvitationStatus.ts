export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];
