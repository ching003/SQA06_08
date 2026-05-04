export const Messages = {
  // Auth
  AUTH_SUCCESS: 'Authentication successful',
  AUTH_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked. Please contact support.',
  ACCOUNT_NOT_ACTIVE: 'Account is not active. Please contact support.',
  TOKEN_REQUIRED: 'Access token is required',
  TOKEN_INVALID: 'Invalid or expired token',

  // User
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already exists',
  PASSWORD_CHANGED: 'Password changed successfully',
  AVATAR_UPLOADED: 'Avatar uploaded successfully',
  ACCOUNT_LOCKED_SUCCESS: 'Account locked successfully',
  ACCOUNT_UNLOCKED_SUCCESS: 'Account unlocked successfully',

  // Company
  COMPANY_CREATED: 'Company registered successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  COMPANY_DELETED: 'Company deleted successfully',
  COMPANY_NOT_FOUND: 'Company not found',
  COMPANY_APPROVED: 'Company approved successfully',
  COMPANY_REJECTED: 'Company rejected successfully',
  COMPANY_NAME_EXISTS: 'Company name already exists',

  // Member
  MEMBER_INVITED: 'Member invited successfully',
  MEMBER_REMOVED: 'Member removed successfully',
  INVITATION_ACCEPTED: 'Invitation accepted successfully',
  INVITATION_REJECTED: 'Invitation rejected successfully',
  INVITATION_CANCELLED: 'Invitation cancelled successfully',
  ALREADY_MEMBER: 'User is already a member',
  NOT_MEMBER: 'User is not a member of this company',

  // CV
  CV_CREATED: 'CV created successfully',
  CV_UPDATED: 'CV updated successfully',
  CV_DELETED: 'CV deleted successfully',
  CV_NOT_FOUND: 'CV not found',
  CV_EXPORTED: 'CV exported successfully',

  // Job
  JOB_CREATED: 'Job created successfully',
  JOB_UPDATED: 'Job updated successfully',
  JOB_DELETED: 'Job deleted successfully',
  JOB_NOT_FOUND: 'Job not found',
  JOB_SAVED: 'Job saved successfully',
  JOB_UNSAVED: 'Job unsaved successfully',

  // Application
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  APPLICATION_UPDATED: 'Application updated successfully',
  APPLICATION_WITHDRAWN: 'Application withdrawn successfully',
  APPLICATION_NOT_FOUND: 'Application not found',
  ALREADY_APPLIED: 'You have already applied to this job',

  // Notification
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read',

  // Generic
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
} as const;

export type Messages = (typeof Messages)[keyof typeof Messages];
