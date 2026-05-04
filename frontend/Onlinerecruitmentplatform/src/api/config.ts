/**
 * API Configuration
 * Base URL và các config cho API calls
 */

// Base URL từ environment variable hoặc default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env;
export const API_BASE_URL = env?.VITE_API_BASE_URL || 'http://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth & User
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    LOGOUT: '/api/users/logout',
    REFRESH: '/api/users/refresh',
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: (id: string) => `/api/users/${id}/profile`,
    UPLOAD_AVATAR: (id: string) => `/api/users/${id}/avatar`,
    CHANGE_PASSWORD: (id: string) => `/api/users/${id}/password`,
  },
  
  // Users (Admin)
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    INFO: (id: string) => `/api/users/${id}/info`,
    AGE: (id: string) => `/api/users/${id}/age`,
    LOCK: (id: string) => `/api/users/${id}/lock`,
    UNLOCK: (id: string) => `/api/users/${id}/unlock`,
    STATUS: (id: string) => `/api/users/${id}/status`,
  },
  
  // Jobs
  JOBS: {
    BASE: '/api/jobs',
    SEARCH: '/api/jobs/search',
    BY_ID: (id: string) => `/api/jobs/${id}`,
    APPLY: (id: string) => `/api/jobs/${id}/apply`,
    SAVE: (id: string) => `/api/jobs/${id}/save`, // POST to save, DELETE to unsave
    RECOMMENDED: '/api/jobs/recommended',
    BY_COMPANY: (companyId: string) => `/api/jobs/company/${companyId}`,
    SIMILAR: (id: string) => `/api/jobs/${id}/similar`,
    CLOSE: (id: string) => `/api/jobs/${id}/close`,
    REPOST: (id: string) => `/api/jobs/${id}/repost`,
    APPROVE: (id: string) => `/api/jobs/${id}/approve`,
    REJECT: (id: string) => `/api/jobs/${id}/reject`,
    LOCK: (id: string) => `/api/jobs/${id}/lock`,
    UNLOCK: (id: string) => `/api/jobs/${id}/unlock`,
    SAVED: '/api/jobs/saved',
  },
  
  // CVs
  CVS: {
    BASE: '/api/cvs',
    BY_ID: (id: string) => `/api/cvs/${id}`,
    EXPORT: (id: string) => `/api/cvs/${id}/export`,
    DUPLICATE: (id: string) => `/api/cvs/${id}/duplicate`,
    BY_USER: (userId: string) => `/api/cvs/user/${userId}`,
    SET_MAIN: (id: string) => `/api/cvs/${id}/main`,
    SEARCH: '/api/cvs/search',
    RECOMMENDED_JOBS: (cvId: string) => `/api/cvs/${cvId}/recommended-jobs`,
    RECOMMENDED_FOR_JOB: (jobId: string) => `/api/jobs/${jobId}/recommended-cvs`,
    // Saved CV endpoints (Recruiter only)
    SAVED: '/api/cvs/saved',
    SAVE: (id: string) => `/api/cvs/${id}/save`,
    SAVE_NOTES: (id: string) => `/api/cvs/${id}/save/notes`,
    CHECK_SAVED: (id: string) => `/api/cvs/${id}/saved`,
  },
  
  // Companies
  COMPANIES: {
    BASE: '/api/companies',
    BY_ID: (id: string) => `/api/companies/${id}`,
    REGISTER: '/api/companies/register',
    MEMBERS: (id: string) => `/api/companies/${id}/members`,
    UPLOAD_LOGO: (id: string) => `/api/companies/${id}/logo`,
    UPLOAD_BANNER: (id: string) => `/api/companies/${id}/banner`,
    APPROVE: (id: string) => `/api/companies/${id}/approve`,
    REJECT: (id: string) => `/api/companies/${id}/reject`,
    LOCK: (id: string) => `/api/companies/${id}/lock`,
    UNLOCK: (id: string) => `/api/companies/${id}/unlock`,
    ACCEPT_INVITATION: (id: string) => `/api/companies/invitations/${id}/accept`,
    REJECT_INVITATION: (id: string) => `/api/companies/invitations/${id}/reject`,
    UPDATE_MEMBER_ROLE: (id: string, memberId: string) => `/api/companies/${id}/members/${memberId}/role`,
    CANCEL_INVITATION: (id: string, invitationId: string) => `/api/companies/${id}/members/invitations/${invitationId}`,
    INVITATIONS: (id: string) => `/api/companies/${id}/members/invitations`,
  },
  
  // Applications
  APPLICATIONS: {
    BASE: '/api/applications',
    BY_ID: (id: string) => `/api/applications/${id}`,
    UPDATE_STATUS: (id: string) => `/api/applications/${id}/status`,
    MY: '/api/applications/my',
    WITHDRAW: (id: string) => `/api/applications/${id}/withdraw`,
    BY_JOB: (jobId: string) => `/api/jobs/${jobId}/applications`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    BY_ID: (id: string) => `/api/notifications/${id}`,
    MY: '/api/notifications/my',
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: (id: string) => `/api/notifications/${id}`,
    DELETE_READ: '/api/notifications/read',
  },
  
  // CV Templates
  CV_TEMPLATES: {
    BASE: '/api/cv-templates',
    BY_ID: (id: string) => `/api/cv-templates/${id}`,
    ACTIVE: '/api/cv-templates/active',
    ACTIVATE: (id: string) => `/api/cv-templates/${id}/activate`,
    DEACTIVATE: (id: string) => `/api/cv-templates/${id}/deactivate`,
  },
} as const;

// Request timeout (milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// Token storage key
export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'currentUser';

// Google Maps Embed API Key
// Lấy từ: https://console.cloud.google.com/apis/credentials
// Enable: Maps Embed API
export const GOOGLE_MAPS_API_KEY = env?.VITE_GOOGLE_MAPS_API_KEY || '';

