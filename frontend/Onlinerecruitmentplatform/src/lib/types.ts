// ============================================
// ENUMS (matching Prisma schema)
// ============================================

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum LanguageLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  NATIVE = 'NATIVE',
}

export enum ExperienceLevel {
  INTERN = 'INTERN',
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AppStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationType {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  COMPANY_REGISTRATION = 'COMPANY_REGISTRATION',
  COMPANY_APPROVED = 'COMPANY_APPROVED',
  COMPANY_REJECTED = 'COMPANY_REJECTED',
  COMPANY_UPDATE_PENDING = 'COMPANY_UPDATE_PENDING',
  COMPANY_INVITATION = 'COMPANY_INVITATION',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  JOB_POSTED = 'JOB_POSTED',
  JOB_APPROVED = 'JOB_APPROVED',
  JOB_REJECTED = 'JOB_REJECTED',
  JOB_UPDATE_PENDING = 'JOB_UPDATE_PENDING',
  WELCOME = 'WELCOME',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  LOCKED = 'LOCKED',
}

export enum JobStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
}

export enum CompanyRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECRUITER = 'RECRUITER',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// ============================================
// MODELS (matching Prisma schema)
// ============================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: Status;
  lastLoginAt: Date | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations (optional for frontend)
  companyMember?: CompanyMember;
  cvs?: CV[];
  applications?: Application[];
  savedJobs?: SavedJob[];
  notifications?: Notification[];
  socialMedias?: SocialMedia[];
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  industry: string | null;
  companySize: CompanySize | null;
  foundedYear: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: CompanyStatus;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  members?: CompanyMember[];
  jobs?: Job[];
  socialMedias?: SocialMedia[];
}

export interface CompanyMember {
  id: string;
  userId: string; // @unique - 1 User chỉ có 1 CompanyMember
  companyId: string;
  companyRole: CompanyRole;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  company?: Company;
}

export interface CompanyMemberInvitation {
  id: string;
  companyId: string;
  userId: string;
  inviterId: string;
  role: CompanyRole;
  status: InvitationStatus;
  expiresAt: Date | null;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: Company;
  user?: User;
  inviter?: User;
  notification?: Notification;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  isMain: boolean;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  address: string | null;
  currentPosition: string | null;
  summary: string | null;
  objective: string | null;
  lastGeneratedAt: Date | null;
  embedding: any; // JSON - Vector embeddings
  isOpenForJob: boolean;
  templateId: string | null;
  pdfUrl: string | null; // URL của file PDF đã generate và lưu trên storage
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  template?: CVTemplate;
  skills?: CVSkill[];
  educations?: Education[];
  certifications?: Certification[];
  workExperiences?: WorkExperience[];
  projects?: Project[];
  languages?: Language[];
  achievements?: Achievement[];
  activities?: Activity[];
  references?: Reference[];
  applications?: Application[];
  recommendJobs?: RecommendJobforCV[];
}

export interface CVSkill {
  id: string;
  cvId: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Education {
  id: string;
  cvId: string;
  institution: string;
  degree: string | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Certification {
  id: string;
  cvId: string;
  name: string;
  issuer: string | null;
  acquiredAt: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface WorkExperience {
  id: string;
  cvId: string;
  title: string;
  company: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Project {
  id: string;
  cvId: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  url: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Language {
  id: string;
  cvId: string;
  name: string;
  level: LanguageLevel;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Achievement {
  id: string;
  cvId: string;
  title: string;
  description: string | null;
  acquiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Activity {
  id: string;
  cvId: string;
  title: string;
  organization: string | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Reference {
  id: string;
  cvId: string;
  name: string;
  position: string | null;
  company: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
}

export interface Salary {
  id: string;
  minAmount: number | null;
  maxAmount: number | null;
  currency: string | null;
  isNegotiable: boolean;
  hideAmount: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  job?: Job;
}

export interface Job {
  id: string;
  companyId: string;
  salaryId: string | null;
  title: string;
  description: string;
  location: string | null;
  industry: string | null;
  experienceLevel: ExperienceLevel | null;
  jobType?: JobType | null;  // Backend response uses jobType
  type?: JobType | null;     // Fallback for compatibility
  embedding: any; // JSON - Vector embeddings
  urgent: boolean;
  status: JobStatus;
  expiresAt: Date | null;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: Company;
  salary?: Salary;
  benefits?: JobBenefit[];
  requirements?: JobRequirement[];
  skills?: JobSkill[];
  applications?: Application[];
  savedJobs?: SavedJob[];
  similarJobs?: SimilarJob[];
  recommendForCVs?: RecommendJobforCV[];
}

export interface JobBenefit {
  id: string;
  jobId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  job?: Job;
}

export interface JobRequirement {
  id: string;
  jobId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  job?: Job;
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  job?: Job;
}

export interface SimilarJob {
  id: string;
  jobId: string;
  similarJobId: string;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  job?: Job;
  similarJob?: Job;
}

export interface Application {
  id: string;
  userId: string;
  cvId: string;
  jobId: string;
  status: AppStatus;
  coverLetter: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  cv?: CV;
  job?: Job;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: Date;

  // Relations
  user?: User;
  job?: Job;
}

export interface SocialMedia {
  id: string;
  userId: string | null;
  companyId: string | null;
  platform: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  company?: Company;
}

export interface RecommendJobforCV {
  id: string;
  cvId: string;
  jobId: string;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cv?: CV;
  job?: Job;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;

  // Relations
  user?: User;
  invitation?: CompanyMemberInvitation;
}

export interface CVTemplate {
  id: string;
  name: string;
  htmlUrl: string;
  previewUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  cvs?: CV[];
}

export interface AdminActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface GetRecentActivitiesResponse {
  activities: AdminActivity[];
}