import { z } from 'zod';
import { JobType } from '../../domain/enums/JobType.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { ExperienceLevel } from '../../domain/enums/ExperienceLevel.js';
import { SkillLevel } from '@modules/cv/domain/enums/SkillLevel.js';

// Helper function to convert date string to Date
const dateTransform = z
  .union([z.string().datetime(), z.date()])
  .transform((val) => (typeof val === 'string' ? new Date(val) : val))
  .optional();

// Validate expiration date must be in the future
const expiresAtSchema = dateTransform.refine(
  (date) => !date || date > new Date(),
  {
    message: 'Ngày hết hạn phải ở trong tương lai',
  }
);

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Get all jobs schema
export const getAllJobsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.nativeEnum(JobStatus).optional(),
  companyId: z.string().uuid().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  urgent: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'salary', 'title', 'applicationCount', 'expiresAt', 'urgent']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search jobs schema
export const searchJobsSchema = z.object({
  query: z.string().trim().max(200, 'Từ khóa tìm kiếm không được vượt quá 200 ký tự').optional(),
  location: z.string().trim().max(100, 'Địa điểm không được vượt quá 100 ký tự').optional(),
  industry: z.string().trim().max(100, 'Ngành nghề không được vượt quá 100 ký tự').optional(),
  jobType: z.nativeEnum(JobType).optional(),
  type: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  salaryMin: z.coerce.number().positive().optional(),
  salaryMax: z.coerce.number().positive().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  urgent: z.coerce.boolean().optional(),
  companyId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Salary schema - matching Prisma schema
const salarySchema = z
  .object({
    minAmount: z.number().nonnegative().optional().nullable(),
    maxAmount: z.number().nonnegative().optional().nullable(),
    currency: z.string().max(10).optional().default('VND'),
    isNegotiable: z.boolean().optional().default(false),
    hideAmount: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // If both min and max are provided, min must be <= max
      if (data.minAmount != null && data.maxAmount != null) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: 'Mức lương tối thiểu không được lớn hơn mức lương tối đa',
      path: ['minAmount'], // Error will be associated with minAmount field
    }
  )
  .optional();

// Benefit schema
const benefitSchema = z.object({
  title: z.string().min(1, { message: 'Benefit title is required' }).max(200),
  description: z.string().max(500).optional().nullable(),
});

// Requirement schema
const requirementSchema = z.object({
  title: z.string().min(1, { message: 'Requirement title is required' }).max(200),
  description: z.string().max(500).optional().nullable(),
});

// Skill schema
const skillSchema = z.object({
  skillName: z.string().min(1, { message: 'Skill name is required' }).max(100),
  level: z.nativeEnum(SkillLevel, { message: 'Invalid skill level' }),
  yearsOfExperience: z.number().int().nonnegative().optional().nullable(),
});

// Create job schema
export const createJobSchema = z.object({
  companyId: z.string().uuid({ message: 'ID công ty không hợp lệ' }).optional(),
  title: z.string().min(3, { message: 'Tiêu đề công việc phải có ít nhất 3 ký tự' }).max(200, 'Tiêu đề công việc không được vượt quá 200 ký tự'),
  description: z.string().min(10, { message: 'Mô tả công việc phải có ít nhất 10 ký tự' }),
  location: z.string().max(200, 'Địa điểm không được vượt quá 200 ký tự').optional().nullable(),
  industry: z.string().max(100, 'Ngành nghề không được vượt quá 100 ký tự').optional().nullable(),
  jobType: z.nativeEnum(JobType, { message: 'Loại hình công việc không hợp lệ' }).optional(),
  type: z.nativeEnum(JobType, { message: 'Loại hình công việc không hợp lệ' }).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel, { message: 'Cấp độ kinh nghiệm không hợp lệ' }).optional(),
  urgent: z.boolean().optional().default(false),
  status: z.nativeEnum(JobStatus, { message: 'Trạng thái không hợp lệ' }).optional(),
  expiresAt: expiresAtSchema,
  salary: salarySchema,
  skills: z.array(skillSchema).optional(),
  benefits: z.array(benefitSchema).optional(),
  requirements: z.array(requirementSchema).optional(),
});

// Update job schema
export const updateJobSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  location: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  jobType: z.nativeEnum(JobType).optional(),
  type: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  urgent: z.boolean().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  expiresAt: expiresAtSchema.nullable(),
  salary: salarySchema.nullable(),
  skills: z.array(skillSchema).optional(),
  benefits: z.array(benefitSchema).optional(),
  requirements: z.array(requirementSchema).optional(),
});

// Repost job schema
export const repostJobSchema = z.object({
  expiresAt: expiresAtSchema,
  publishNow: z.boolean().optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  location: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  jobType: z.nativeEnum(JobType).optional(),
  type: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  urgent: z.boolean().optional(),
  salary: salarySchema,
  skills: z.array(skillSchema).optional(),
  benefits: z.array(benefitSchema).optional(),
  requirements: z.array(requirementSchema).optional(),
});

// Reject job schema
export const rejectJobSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Get similar jobs schema
export const getSimilarJobsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  minSimilarity: z.coerce.number().min(0).max(1).optional().default(0),
});

// Get jobs by company schema
export const getJobsByCompanySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.nativeEnum(JobStatus).optional(),
});

// Get recommended jobs schema
export const getRecommendedJobsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
export type GetAllJobsInput = z.infer<typeof getAllJobsSchema>;
export type RepostJobInput = z.infer<typeof repostJobSchema>;
