# API Coverage Checklist

## ✅ Đã khai báo đầy đủ các API Services

### 1. User & Authentication API ✅
**Service:** `userService`  
**File:** `src/api/services/userService.ts`

- ✅ POST `/api/users/login` - Login
- ✅ POST `/api/users/register` - Register
- ✅ POST `/api/users/logout` - Logout
- ✅ POST `/api/users/refresh` - Refresh token
- ✅ GET `/api/users/profile` - Get profile
- ✅ PUT `/api/users/profile` - Update profile
- ✅ GET `/api/users` - Get all users (Admin)

### 2. Job API ✅
**Service:** `jobService`  
**File:** `src/api/services/jobService.ts`

- ✅ GET `/api/jobs` - Get all jobs (with filters)
- ✅ GET `/api/jobs/:id` - Get job by ID
- ✅ POST `/api/jobs` - Create job (Recruiter)
- ✅ PUT `/api/jobs/:id` - Update job (Recruiter/Admin)
- ✅ DELETE `/api/jobs/:id` - Delete job (Recruiter/Admin)
- ✅ POST `/api/jobs/:id/apply` - Apply to job
- ✅ POST `/api/jobs/:id/save` - Save job
- ✅ DELETE `/api/jobs/:id/unsave` - Unsave job
- ✅ GET `/api/jobs/recommended` - Get recommended jobs

### 3. CV API ✅
**Service:** `cvService`  
**File:** `src/api/services/cvService.ts`

- ✅ GET `/api/cvs` - Get all CVs (with filters)
- ✅ GET `/api/cvs/:id` - Get CV by ID
- ✅ POST `/api/cvs` - Create CV
- ✅ PUT `/api/cvs/:id` - Update CV
- ✅ DELETE `/api/cvs/:id` - Delete CV
- ✅ POST `/api/cvs/:id/export` - Export CV to PDF/DOCX

**Note:** CV API hỗ trợ nested data (educations, workExperiences, skills) trong create/update requests.

### 4. Application API ✅
**Service:** `applicationService`  
**File:** `src/api/services/applicationService.ts`

- ✅ GET `/api/applications` - Get all applications (with filters)
- ✅ GET `/api/applications/:id` - Get application by ID
- ✅ PUT `/api/applications/:id/status` - Update application status (Recruiter/Admin)

**Note:** Application được tạo tự động khi apply job, không có endpoint create riêng.

### 5. Company API ✅
**Service:** `companyService`  
**File:** `src/api/services/companyService.ts`

- ✅ GET `/api/companies` - Get all companies
- ✅ GET `/api/companies/:id` - Get company by ID
- ✅ POST `/api/companies/register` - Register company
- ✅ PUT `/api/companies/:id` - Update company
- ✅ GET `/api/companies/:id/members` - Get company members
- ✅ POST `/api/companies/:id/members/invite` - Invite member
- ✅ DELETE `/api/companies/:id/members/:memberId` - Remove member

### 6. Notification API ✅
**Service:** `notificationService`  
**File:** `src/api/services/notificationService.ts`

- ✅ GET `/api/notifications/my` - Get my notifications
- ✅ GET `/api/notifications/:id` - Get notification by ID
- ✅ GET `/api/notifications/unread-count` - Get unread count
- ✅ PATCH `/api/notifications/:id/read` - Mark as read
- ✅ PATCH `/api/notifications/mark-all-read` - Mark all as read

### 7. CV Template API ✅
**Service:** `cvTemplateService`  
**File:** `src/api/services/cvTemplateService.ts`

- ✅ GET `/api/cv-templates/active` - Get active templates (Public)
- ✅ GET `/api/cv-templates` - Get all templates (Auth required)
- ✅ GET `/api/cv-templates/:id` - Get template by ID
- ✅ POST `/api/cv-templates` - Create template (Admin only)
- ✅ PUT `/api/cv-templates/:id` - Update template (Admin only)
- ✅ DELETE `/api/cv-templates/:id` - Delete template (Admin only)

**Note:** Create/Update hỗ trợ file upload (multipart/form-data).

---

## 📋 Tổng kết

- **Tổng số API Services:** 7
- **Tổng số endpoints đã khai báo:** ~40+
- **Status:** ✅ **ĐÃ KHAI BÁO ĐẦY ĐỦ**

## 🚀 Cách sử dụng

```typescript
import { 
  userService,
  jobService,
  cvService,
  applicationService,
  companyService,
  notificationService,
  cvTemplateService
} from '../api/services';
```

## 📝 Lưu ý

1. Tất cả services đã được export từ `src/api/services/index.ts`
2. API client tự động thêm JWT token vào headers
3. Error handling được xử lý tự động
4. Token hết hạn sẽ tự động redirect về login

## 🔄 Cập nhật

Nếu có API mới, thêm vào:
1. Tạo service file mới trong `src/api/services/`
2. Export từ `src/api/services/index.ts`
3. Cập nhật file này

