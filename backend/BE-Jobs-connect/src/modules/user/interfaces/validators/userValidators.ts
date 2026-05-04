import { z } from 'zod';
import { UserRole } from '../../domain/enums/UserRole.js';
import { Gender } from '../../domain/enums/Gender.js';
import { UserStatus } from '../../domain/enums/UserStatus.js';

// Common schemas
const emailSchema = z.string().email('Invalid email format');

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const phoneNumberSchema = z
  .string()
  .regex(/^(0|\+84)[0-9]{9,10}$/, 'Invalid phone number format')
  .optional()
  .nullable();

const genderSchema = z.nativeEnum(Gender).optional().nullable();

const roleSchema = z.nativeEnum(UserRole).optional();

const statusSchema = z.nativeEnum(UserStatus).optional();

const dateOfBirthSchema = z
  .string()
  .transform((val) => (val ? new Date(val) : null))
  .refine((date) => !date || date <= new Date(), {
    message: 'Date of birth cannot be in the future',
  })
  .optional()
  .nullable();

const fullNameSchema = z.string().min(2, 'Full name must be at least 2 characters');

// Register schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema.optional(),
  phoneNumber: phoneNumberSchema,
  gender: genderSchema,
  role: roleSchema,
  dateOfBirth: dateOfBirthSchema,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Create user schema (admin)
export const createUserSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    fullName: fullNameSchema,
    phoneNumber: phoneNumberSchema,
    gender: genderSchema,
    role: roleSchema,
    dateOfBirth: dateOfBirthSchema,
    status: statusSchema,
    avatarUrl: z.string().url().optional().nullable(),
  })
  .refine((data) => !('passwordHash' in data), {
    message: 'Do not send passwordHash. Send password (plain text) instead.',
  })
  .refine((data) => !('rawPassword' in data), {
    message: 'Do not send rawPassword. Send password (plain text) instead.',
  });

// Update user schema (admin) - only role and status can be updated
export const updateUserSchema = z.object({
  role: roleSchema,
  status: statusSchema,
});

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  phoneNumber: phoneNumberSchema,
  gender: genderSchema,
  dateOfBirth: dateOfBirthSchema,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });

// Update status schema
export const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    message: `Status must be one of: ${Object.values(UserStatus).join(', ')}`,
  }),
});

// ID parameter schema
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Query params schema for getAllUsers
export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  orderBy: z.string().optional().default('createdAt:desc'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
