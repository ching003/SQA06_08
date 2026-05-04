import { z } from 'zod';
import { CompanySize } from '../../domain/enums/CompanySize.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { InvitationStatus } from '../../domain/enums/InvitationStatus.js';

// Common schemas
const companyNameSchema = z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự');
const emailSchema = z.string().email('Định dạng email không hợp lệ');
const phoneSchema = z
  .string()
  .regex(/^0\d{9}$/, 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0')
  .optional()
  .nullable();
const websiteSchema = z.string().url('Định dạng website không hợp lệ').optional().nullable();
const addressSchema = z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').optional().nullable();
const descriptionSchema = z.string().optional().nullable();

// Company ID param schema
export const companyIdParamSchema = z.object({
  id: z.string().min(1, 'ID công ty là bắt buộc'),
});

// Member ID param schema
export const memberIdParamSchema = z.object({
  id: z.string().min(1, 'ID công ty là bắt buộc'),
  memberId: z.string().min(1, 'ID thành viên là bắt buộc'),
});

// Invitation ID param schema
export const invitationIdParamSchema = z.object({
  invitationId: z.string().min(1, 'ID lời mời là bắt buộc'),
});

export const companyInvitationIdParamSchema = z.object({
  id: z.string().min(1, 'ID công ty là bắt buộc'),
  invitationId: z.string().min(1, 'ID lời mời là bắt buộc'),
});

// Industry schema
const industrySchema = z.string().optional().nullable();

// Founded year schema
const foundedYearSchema = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z
    .number()
    .int('Năm thành lập phải là số nguyên')
    .min(1800, 'Năm thành lập không thể nhỏ hơn 1800')
    .max(new Date().getFullYear(), `Năm thành lập không thể lớn hơn năm hiện tại (${new Date().getFullYear()})`)
    .optional()
    .nullable()
);

// Register company schema
export const registerCompanySchema = z.object({
  name: companyNameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  website: websiteSchema,
  address: addressSchema,
  description: descriptionSchema,
  industry: industrySchema,
  companySize: z.nativeEnum(CompanySize).optional(),
  foundedYear: foundedYearSchema,
});

// Update company schema
export const updateCompanySchema = z.object({
  name: companyNameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  website: websiteSchema,
  address: addressSchema,
  description: descriptionSchema,
  industry: industrySchema,
  companySize: z.nativeEnum(CompanySize).optional().nullable(),
  foundedYear: foundedYearSchema,
});

// Get companies query schema
export const getCompaniesQuerySchema = z.object({
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
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  size: z.nativeEnum(CompanySize).optional(),
  industry: z.string().optional(),
  orderBy: z.string().optional().default('createdAt:desc'),
});

// Invite member schema
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(CompanyRole, {
    message: `Role must be one of: ${Object.values(CompanyRole).join(', ')}`,
  }),
});

// Update member role schema
export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(CompanyRole, {
    message: `Role must be one of: ${Object.values(CompanyRole).join(', ')}`,
  }),
});

// Reject company schema
export const rejectCompanySchema = z.object({
  reason: z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự').optional(),
});

// List invitations query schema
export const listInvitationsQuerySchema = z.object({
  status: z.nativeEnum(InvitationStatus).optional(),
});

// Export types
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type GetCompaniesQuery = z.infer<typeof getCompaniesQuerySchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RejectCompanyInput = z.infer<typeof rejectCompanySchema>;
