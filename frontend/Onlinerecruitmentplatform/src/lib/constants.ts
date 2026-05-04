/**
 * Application Constants
 * Các hằng số dùng chung trong ứng dụng
 */

import { ExperienceLevel, JobType, CompanySize, CompanyRole, UserRole, JobStatus, AppStatus, InvitationStatus } from './types';

// ============================================
// COMPANY ROLES (Quyền trong công ty)
// ============================================
export const COMPANY_ROLES = [
  { value: CompanyRole.OWNER, label: 'Chủ sở hữu' },
  { value: CompanyRole.MANAGER, label: 'Quản lý' },
  { value: CompanyRole.RECRUITER, label: 'Nhà tuyển dụng' },
];

export const getCompanyRoleLabel = (role: CompanyRole | string | null | undefined): string => {
  if (!role) return 'Không xác định';
  const found = COMPANY_ROLES.find(item => item.value === role);
  return found ? found.label : String(role);
};

// ============================================
// USER ROLES (Vai trò người dùng)
// ============================================
export const USER_ROLES = [
  { value: UserRole.CANDIDATE, label: 'Ứng viên' },
  { value: UserRole.RECRUITER, label: 'Nhà tuyển dụng' },
  { value: UserRole.ADMIN, label: 'Quản trị viên' },
];

export const getUserRoleLabel = (role: UserRole | string | null | undefined): string => {
  if (!role) return 'Không xác định';
  const found = USER_ROLES.find(item => item.value === role);
  return found ? found.label : String(role);
};

// ============================================
// JOB STATUS (Trạng thái tin tuyển dụng)
// ============================================
export const JOB_STATUSES = [
  { value: JobStatus.PENDING, label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  { value: JobStatus.APPROVED, label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800' },
  { value: JobStatus.REJECTED, label: 'Từ chối', color: 'bg-red-100 text-red-800' },
  { value: JobStatus.ACTIVE, label: 'Đang hiển thị', color: 'bg-green-100 text-green-800' },
  { value: JobStatus.INACTIVE, label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' },
  { value: JobStatus.DRAFT, label: 'Lưu nháp', color: 'bg-slate-100 text-slate-800' },
  { value: JobStatus.EXPIRED, label: 'Hết hạn', color: 'bg-orange-100 text-orange-800' },
  { value: JobStatus.CLOSED, label: 'Đã đóng', color: 'bg-red-100 text-red-800' },
  { value: JobStatus.LOCKED, label: 'Bị khóa', color: 'bg-red-100 text-red-800' },
];

export const getJobStatusLabel = (status: JobStatus | string | null | undefined): string => {
  if (!status) return 'Không xác định';
  const found = JOB_STATUSES.find(item => item.value === status);
  return found ? found.label : String(status);
};

export const getJobStatusColor = (status: JobStatus | string | null | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const found = JOB_STATUSES.find(item => item.value === status);
  return found ? found.color : 'bg-gray-100 text-gray-800';
};

// ============================================
// APPLICATION STATUS (Trạng thái đơn ứng tuyển)
// ============================================
// PENDING: Đơn ứng tuyển mới, đang chờ xử lý (trạng thái mặc định)
// REVIEWING: Đang được nhà tuyển dụng xem xét
// ACCEPTED: Đơn ứng tuyển được chấp nhận
// REJECTED: Đơn ứng tuyển bị từ chối
// CANCELLED: Ứng viên đã rút đơn (withdraw)
export const APPLICATION_STATUSES = [
  { value: AppStatus.PENDING, label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  { value: AppStatus.REVIEWING, label: 'Đang xem xét', color: 'bg-blue-100 text-blue-800' },
  { value: AppStatus.ACCEPTED, label: 'Đã chấp nhận', color: 'bg-green-100 text-green-800' },
  { value: AppStatus.REJECTED, label: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
  { value: AppStatus.CANCELLED, label: 'Đã rút đơn', color: 'bg-gray-100 text-gray-800' },
];

export const getApplicationStatusLabel = (status: AppStatus | string | null | undefined): string => {
  if (!status) return 'Không xác định';
  const found = APPLICATION_STATUSES.find(item => item.value === status);
  return found ? found.label : String(status);
};

export const getApplicationStatusColor = (status: AppStatus | string | null | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const found = APPLICATION_STATUSES.find(item => item.value === status);
  return found ? found.color : 'bg-gray-100 text-gray-800';
};

// ============================================
// INVITATION STATUS (Trạng thái lời mời)
// ============================================
export const INVITATION_STATUSES = [
  { value: InvitationStatus.PENDING, label: 'Chờ phản hồi', color: 'bg-yellow-100 text-yellow-800' },
  { value: InvitationStatus.ACCEPTED, label: 'Đã chấp nhận', color: 'bg-green-100 text-green-800' },
  { value: InvitationStatus.REJECTED, label: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
];

export const getInvitationStatusLabel = (status: InvitationStatus | string | null | undefined): string => {
  if (!status) return 'Không xác định';
  const found = INVITATION_STATUSES.find(item => item.value === status);
  return found ? found.label : String(status);
};

// ============================================
// INDUSTRIES (Database uses Vietnamese values)
// ============================================
export const INDUSTRIES = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
  { value: 'Tài chính - Ngân hàng', label: 'Tài chính - Ngân hàng' },
  { value: 'Sản xuất', label: 'Sản xuất' },
  { value: 'Bán lẻ', label: 'Bán lẻ' },
  { value: 'Y tế - Chăm sóc sức khỏe', label: 'Y tế - Chăm sóc sức khỏe' },
  { value: 'Giáo dục - Đào tạo', label: 'Giáo dục - Đào tạo' },
  { value: 'Marketing - Truyền thông', label: 'Marketing - Truyền thông' },
  { value: 'Bất động sản', label: 'Bất động sản' },
  { value: 'Khách sạn - Du lịch', label: 'Khách sạn - Du lịch' },
  { value: 'Vận tải - Logistics', label: 'Vận tải - Logistics' },
  { value: 'Tư vấn', label: 'Tư vấn' },
  { value: 'Xây dựng', label: 'Xây dựng' },
  { value: 'Nông nghiệp', label: 'Nông nghiệp' },
  { value: 'Năng lượng', label: 'Năng lượng' },
  { value: 'Truyền thông - Giải trí', label: 'Truyền thông - Giải trí' },
  { value: 'Pháp lý', label: 'Pháp lý' },
  { value: 'Bảo hiểm', label: 'Bảo hiểm' },
  { value: 'Viễn thông', label: 'Viễn thông' },
  { value: 'Khác', label: 'Khác' },
] as const;

// Industries without "all" option (for forms)
export const INDUSTRY_OPTIONS = INDUSTRIES.filter(i => i.value !== 'all');

// ============================================
// SALARY RANGES
// ============================================
export const SALARY_RANGES = [
  { value: 'all', label: 'Tất cả mức lương', min: 0, max: 0 },
  { value: 'under-10', label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { value: '10-15', label: '10 - 15 triệu', min: 10000000, max: 15000000 },
  { value: '15-20', label: '15 - 20 triệu', min: 15000000, max: 20000000 },
  { value: '20-25', label: '20 - 25 triệu', min: 20000000, max: 25000000 },
  { value: '25-30', label: '25 - 30 triệu', min: 25000000, max: 30000000 },
  { value: '30-50', label: '30 - 50 triệu', min: 30000000, max: 50000000 },
  { value: '50-100', label: '50 - 100 triệu', min: 50000000, max: 100000000 },
  { value: 'above-100', label: 'Trên 100 triệu', min: 100000000, max: 999999999 },
  { value: 'negotiable', label: 'Thoả thuận', min: -1, max: -1 },
] as const;

// ============================================
// EXPERIENCE LEVELS
// ============================================
export const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'Tất cả kinh nghiệm' },
  { value: ExperienceLevel.INTERN, label: 'Thực tập sinh' },
  { value: ExperienceLevel.FRESHER, label: 'Fresher (0-1 năm)' },
  { value: ExperienceLevel.JUNIOR, label: 'Junior (1-2 năm)' },
  { value: ExperienceLevel.MIDDLE, label: 'Middle (2-4 năm)' },
  { value: ExperienceLevel.SENIOR, label: 'Senior (5+ năm)' },
  { value: ExperienceLevel.LEAD, label: 'Lead/Trưởng nhóm' },
  { value: ExperienceLevel.MANAGER, label: 'Manager' },
] as const;

// Experience levels without "all" option (for forms)
export const EXPERIENCE_LEVEL_OPTIONS = EXPERIENCE_LEVELS.filter(l => l.value !== 'all');

// ============================================
// JOB TYPES
// ============================================
export const JOB_TYPES = [
  { value: 'all', label: 'Tất cả loại việc' },
  { value: JobType.FULL_TIME, label: 'Toàn thời gian' },
  { value: JobType.PART_TIME, label: 'Bán thời gian' },
  { value: JobType.CONTRACT, label: 'Hợp đồng' },
  { value: JobType.INTERNSHIP, label: 'Thực tập' },
  { value: JobType.FREELANCE, label: 'Freelance' },
] as const;

// Job types without "all" option (for forms)
export const JOB_TYPE_OPTIONS = JOB_TYPES.filter(t => t.value !== 'all');

// ============================================
// COMPANY SIZES
// ============================================
export const COMPANY_SIZES = [
  { value: 'all', label: 'Tất cả quy mô' },
  { value: CompanySize.STARTUP, label: 'Startup (1-10 nhân viên)' },
  { value: CompanySize.SMALL, label: 'Nhỏ (11-50 nhân viên)' },
  { value: CompanySize.MEDIUM, label: 'Vừa (51-200 nhân viên)' },
  { value: CompanySize.LARGE, label: 'Lớn (201-500 nhân viên)' },
  { value: CompanySize.ENTERPRISE, label: 'Doanh nghiệp (500+ nhân viên)' },
] as const;

// Company sizes without "all" option (for forms)
export const COMPANY_SIZE_OPTIONS = COMPANY_SIZES.filter(s => s.value !== 'all');

// ============================================
// LOCATIONS (Vietnam)
// ============================================
export const VIETNAM_PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Bắc Ninh',
  'Hưng Yên',
  'Vĩnh Phúc',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Thừa Thiên Huế',
  'Khánh Hòa',
  'Bình Thuận',
  'Lâm Đồng',
  'An Giang',
  'Kiên Giang',
  'Long An',
] as const;

// Hanoi Districts
export const HANOI_DISTRICTS = [
  'Hà Nội',
  'Ba Đình',
  'Hoàn Kiếm',
  'Hai Bà Trưng',
  'Đống Đa',
  'Tây Hồ',
  'Cầu Giấy',
  'Thanh Xuân',
  'Hoàng Mai',
  'Long Biên',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông',
  'Sơn Tây',
  'Mê Linh',
  'Đông Anh',
  'Gia Lâm',
  'Sóc Sơn',
  'Thanh Trì',
  'Thường Tín',
  'Phú Xuyên',
  'Ứng Hòa',
  'Thạch Thất',
  'Quốc Oai',
  'Chương Mỹ',
  'Thanh Oai',
  'Phúc Thọ',
  'Ba Vì',
  'Mỹ Đức',
] as const;

// Ho Chi Minh Districts
export const HCMC_DISTRICTS = [
  'Hồ Chí Minh',
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Thủ Đức',
  'Bình Tân',
  'Củ Chi',
  'Hóc Môn',
  'Bình Chánh',
  'Nhà Bè',
  'Cần Giờ',
] as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get label for experience level
 */
export const getExperienceLevelLabel = (level: ExperienceLevel | null | undefined): string => {
  if (!level) return 'Không yêu cầu';
  const found = EXPERIENCE_LEVELS.find(l => l.value === level);
  return found?.label || level;
};

/**
 * Get label for job type
 */
export const getJobTypeLabel = (type: JobType | null | undefined): string => {
  if (!type) return 'Không xác định';
  const found = JOB_TYPES.find(t => t.value === type);
  return found?.label || type;
};

/**
 * Get label for company size
 */
export const getCompanySizeLabel = (size: CompanySize | null | undefined): string => {
  if (!size) return 'Không xác định';
  const found = COMPANY_SIZES.find(s => s.value === size);
  return found?.label || size;
};

/**
 * Get label for industry
 */
export const getIndustryLabel = (industry: string | null | undefined): string => {
  if (!industry) return 'Không xác định';
  const found = INDUSTRIES.find(i => i.value === industry);
  return found?.label || industry;
};

/**
 * Format salary to Vietnamese format
 */
export const formatSalaryVND = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu`;
  }
  return `${amount.toLocaleString('vi-VN')} đ`;
};

/**
 * Format salary range
 */
export const formatSalaryRange = (
  minAmount: number | null | undefined,
  maxAmount: number | null | undefined,
  currency: string = 'VND',
  hideAmount: boolean = false,
  isNegotiable: boolean = false
): string => {
  // Nếu lương là thỏa thuận hoặc ẩn số tiền, hiển thị "Thỏa thuận"
  if (hideAmount || isNegotiable || (!minAmount && !maxAmount)) return 'Thỏa thuận';

  if (currency === 'VND' || currency === 'vnd') {
    const format = (val: number) => formatSalaryVND(val);
    if (minAmount && maxAmount) return `${format(minAmount)} - ${format(maxAmount)}`;
    if (minAmount) return `Từ ${format(minAmount)}`;
    if (maxAmount) return `Tới ${format(maxAmount)}`;
  }

  if (currency === 'USD' || currency === 'usd') {
    if (minAmount && maxAmount) return `$${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`;
    if (minAmount) return `Từ $${minAmount.toLocaleString()}`;
    if (maxAmount) return `Tới $${maxAmount.toLocaleString()}`;
  }

  return 'Thỏa thuận';
};

