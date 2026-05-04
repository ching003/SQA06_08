import { z } from 'zod';
import { Gender } from '@modules/user/domain/enums/index.js';
import { SkillLevel, LanguageLevel } from '../../domain/enums/index.js';

// Common schemas
const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

// Transform string to Date for date fields
const dateSchema = z
  .union([z.string().datetime(), z.date()])
  .transform((val) => (typeof val === 'string' ? new Date(val) : val))
  .optional();

const dateSchemaOptionalNullable = z
  .union([z.string().datetime(), z.date(), z.null()])
  .transform((val) => {
    if (val === null) return null;
    return typeof val === 'string' ? new Date(val) : val;
  })
  .optional();

// Nested CV data schemas
const skillSchema = z.object({
  skillName: z.string().min(1, { message: 'Skill name is required' }).max(100),
  level: z.nativeEnum(SkillLevel).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, { message: 'Institution is required' }).max(200),
  degree: z.string().max(100).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  description: z.string().max(2000).optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, { message: 'Certification name is required' }).max(200),
  issuer: z.string().max(200).optional(),
  acquiredAt: dateSchema,
  description: z.string().max(1000).optional(),
});

const workExperienceSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100),
  company: z.string().min(1, { message: 'Company is required' }).max(200),
  startDate: dateSchema,
  endDate: dateSchema,
  description: z.string().max(3000).optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }).max(200),
  description: z.string().max(2000).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  url: z.string().url().max(500).optional().or(z.literal('')),
  role: z.string().max(100).optional(),
});

const languageSchema = z.object({
  name: z.string().min(1, { message: 'Language name is required' }).max(50),
  level: z.nativeEnum(LanguageLevel).optional(),
  description: z.string().max(500).optional(),
});

const achievementSchema = z.object({
  title: z.string().min(1, { message: 'Achievement title is required' }).max(200),
  description: z.string().max(1000).optional(),
  acquiredAt: dateSchema,
});

const activitySchema = z.object({
  title: z.string().min(1, { message: 'Activity title is required' }).max(200),
  organization: z.string().max(200).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  description: z.string().max(1000).optional(),
});

const referenceSchema = z.object({
  name: z.string().min(1, { message: 'Reference name is required' }).max(100),
  position: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

// Create CV schema
export const createCVSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(200),
  templateId: uuidSchema.optional(),
  fullName: z.string().max(100).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  phoneNumber: z.string().max(20).optional(),
  dateOfBirth: dateSchema,
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().max(300).optional(),
  currentPosition: z.string().max(100).optional(),
  summary: z.string().max(5000).optional(),
  objective: z.string().max(2000).optional(),
  isMain: z.boolean().optional(),
  isOpenForJob: z.boolean().optional(),
  skills: z.array(skillSchema).optional(),
  educations: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  workExperiences: z.array(workExperienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  languages: z.array(languageSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  activities: z.array(activitySchema).optional(),
  references: z.array(referenceSchema).optional(),
});

// Update CV schema
export const updateCVSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: uuidSchema.optional().nullable(),
  fullName: z.string().max(100).optional().nullable(),
  email: z.string().email().max(100).optional().nullable().or(z.literal('')),
  phoneNumber: z.string().max(20).optional().nullable(),
  dateOfBirth: dateSchemaOptionalNullable,
  gender: z.nativeEnum(Gender).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  currentPosition: z.string().max(100).optional().nullable(),
  summary: z.string().max(5000).optional().nullable(),
  objective: z.string().max(2000).optional().nullable(),
  isMain: z.boolean().optional(),
  isOpenForJob: z.boolean().optional(),
  skills: z.array(skillSchema).optional(),
  educations: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  workExperiences: z.array(workExperienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  languages: z.array(languageSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  activities: z.array(activitySchema).optional(),
  references: z.array(referenceSchema).optional(),
});

// Search CVs schema
export const searchCVsSchema = z.object({
  query: z.string().max(200).optional(),
  skills: z.array(z.string()).or(z.string().transform((s) => s.split(','))).optional(),
  location: z.string().max(200).optional(),
  educationLevel: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Save CV schema - notes is optional when saving CV
export const saveCVSchema = z.object({
  notes: z.string().max(2000).optional(),
});

// Save CV notes schema - notes is optional to allow clearing/deleting notes
export const updateSavedCVNotesSchema = z.object({
  notes: z.string().max(2000).optional(),
});

// Pagination query schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Get All CVs query schema
export const getAllCVsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  userId: uuidSchema.optional(),
  isOpenForJob: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  orderBy: z.string().max(50).optional().default('createdAt:desc'),
});

// Export CV schema
export const exportCVSchema = z.object({
  templateId: uuidSchema.optional(),
  forceRegenerate: z.boolean().optional().default(false),
});

// Duplicate CV schema
export const duplicateCVSchema = z.object({
  newTitle: z.string().min(1).max(200).optional(),
  isOpenForJob: z.boolean().optional(),
});

export type CreateCVInput = z.infer<typeof createCVSchema>;
export type UpdateCVInput = z.infer<typeof updateCVSchema>;
export type SearchCVsInput = z.infer<typeof searchCVsSchema>;
export type SaveCVInput = z.infer<typeof saveCVSchema>;
export type UpdateSavedCVNotesInput = z.infer<typeof updateSavedCVNotesSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type GetAllCVsInput = z.infer<typeof getAllCVsSchema>;
export type ExportCVInput = z.infer<typeof exportCVSchema>;
export type DuplicateCVInput = z.infer<typeof duplicateCVSchema>;
