# JobsConnect - Job API Documentation

## Base URL
```
/api/jobs
```

## Authentication
Một số endpoints là public (không cần authentication), một số yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get All Jobs (Public)

- **Method**: `GET`
- **URL**: `/api/jobs`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10, max: 100)
  - `status`: enum (optional, default: ACTIVE) - DRAFT, ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED
  - `location`: string (optional) - Filter by location
  - `industry`: string (optional) - Filter by industry
  - `experienceLevel`: enum (optional) - INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER
  - `type`: enum (optional) - FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
  - `urgent`: boolean (optional) - Filter urgent jobs

### Xử lý
1. Parse query parameters
2. Validate pagination (page > 0, limit 1-100)
3. Build search filters
4. Query jobs với pagination (mặc định chỉ lấy ACTIVE nếu không chỉ định status)
5. Return list jobs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "description": "...",
          "location": "Ho Chi Minh City",
          "status": "ACTIVE",
          "company": {
            "id": "uuid",
            "name": "TechCorp Vietnam"
          },
          "salary": {
            "minAmount": 25000000,
            "maxAmount": 40000000,
            "currency": "VND"
          }
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "totalPages": 10
      }
    }
  }
  ```
- **Error Responses**:
  - 400: Page must be a positive number / Limit must be a number between 1 and 100
  - 500: Server error

---

## 2. Search Jobs (Public)

- **Method**: `GET`
- **URL**: `/api/jobs/search`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Query Parameters**:
  - `query`: string (optional) - Search query (searches in title and description, case-insensitive)
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10, max: 100)
  - `location`: string (optional) - Filter by location (case-insensitive partial match)
  - `industry`: string (optional) - Filter by industry (case-insensitive partial match)
  - `experienceLevel`: enum (optional) - INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER
  - `type`: enum (optional) - FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
  - `status`: enum (optional) - DRAFT, ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED (default: ACTIVE if not specified)
  - `urgent`: boolean (optional) - Filter urgent jobs (true/false)
  - `companyId`: string (optional, UUID) - Filter by company ID

### Xử lý
1. Parse query parameters
2. Validate pagination (page > 0, limit 1-100)
3. Validate search filters
4. Build search filters:
   - Text search: `query` searches in `title` and `description` (case-insensitive)
   - Location/Industry: partial match (case-insensitive)
   - Other filters: exact match
   - Default status: ACTIVE (nếu không chỉ định status)
5. Search jobs với pagination
6. Return list jobs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "jobs": [...],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 10,
        "totalPages": 5
      }
    }
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid pagination
  - 500: Server error

---

## 3. Get Job By ID (Public)

- **Method**: `GET`
- **URL**: `/api/jobs/:id`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Tìm job theo ID với tất cả relations (company, salary, benefits, requirements)
3. Return job data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "description": "...",
      "location": "Ho Chi Minh City",
      "status": "ACTIVE",
      "company": {
        "id": "uuid",
        "name": "TechCorp Vietnam"
      },
      "salary": {
        "minAmount": 25000000,
        "maxAmount": 40000000,
        "currency": "VND"
      },
      "benefits": [...],
      "requirements": [...]
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 404: Job not found
  - 500: Server error

---

## 4. Get Jobs By Company (Public)

- **Method**: `GET`
- **URL**: `/api/jobs/company/:companyId`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Path Parameters**:
  - `companyId`: string (required, UUID format)
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10, max: 100)
  - `status`: enum (optional) - Filter by status

### Xử lý
1. Validate company ID format
2. Validate pagination
3. Query jobs theo companyId với pagination
4. Return list jobs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "jobs": [...],
      "pagination": {
        "total": 20,
        "page": 1,
        "limit": 10,
        "totalPages": 2
      }
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID / Invalid pagination
  - 500: Server error

---

## 5. Create Job (Recruiter)

- **Method**: `POST`
- **URL**: `/api/jobs`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Senior Software Engineer",
    "description": "We are looking for...",
    "location": "Ho Chi Minh City, Vietnam",
    "industry": "Technology",
    "experienceLevel": "SENIOR",
    "type": "FULL_TIME",
    "urgent": false,
    "status": "DRAFT",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "salary": {
      "minAmount": 25000000,
      "maxAmount": 40000000,
      "currency": "VND",
      "isNegotiable": true,
      "hideAmount": false
    },
    "benefits": [
      {
        "title": "Competitive Salary",
        "description": "Attractive salary package"
      }
    ],
    "requirements": [
      {
        "title": "Education",
        "description": "Bachelor degree"
      }
    ]
  }
  ```
  - `title`: string (required, min 3 chars)
  - `description`: string (required, min 10 chars)
  - `location`, `industry`, `experienceLevel`, `type`, `urgent`, `expiresAt`: optional
  - `status`: enum (optional, default: ACTIVE) - **DRAFT** (lưu nháp), ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED
  - `salary`, `benefits`, `requirements`: optional nested objects/arrays
  - **Lưu ý**: companyId sẽ tự động lấy từ token (userId -> CompanyMember -> companyId)

### Xử lý
1. Validate input (title, description required)
2. Lấy companyId từ userId thông qua CompanyMember
3. Kiểm tra user là member của company với role OWNER/MANAGER/RECRUITER
4. Kiểm tra company status = ACTIVE
5. Tạo job với status (mặc định ACTIVE, có thể đặt DRAFT để lưu nháp)
6. Tạo salary nếu có
7. Tạo benefits nếu có
8. Tạo requirements nếu có
9. Return job data với relations

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "status": "ACTIVE",
      "companyId": "uuid",
      "salary": {...},
      "benefits": [...],
      "requirements": [...]
    },
    "message": "Job created successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Company must be active
  - 403: Unauthorized / You must be a member of a company
  - 404: Company not found
  - 500: Server error

---

## 6. Update Job (Recruiter)

- **Method**: `PUT`
- **URL**: `/api/jobs/:id`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company sở hữu job

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (tất cả optional):
  ```json
  {
    "title": "Senior Software Engineer - Updated",
    "description": "Updated job description...",
    "location": "Ho Chi Minh City, Vietnam",
    "urgent": true,
    "expiresAt": "2025-01-31T23:59:59.000Z",
    "salary": {
      "minAmount": 30000000,
      "maxAmount": 45000000,
      "currency": "VND"
    }
  }
  ```

### Xử lý
1. Validate job ID format
2. Validate update data
3. Kiểm tra job tồn tại
4. Kiểm tra permission (user là member của company sở hữu job)
5. Cập nhật job fields
6. Cập nhật salary nếu có (update hoặc create)
7. Cập nhật benefits nếu có (delete all và recreate)
8. Cập nhật requirements nếu có (delete all và recreate)
9. Return updated job data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Senior Software Engineer - Updated",
      "status": "ACTIVE"
    },
    "message": "Job updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid job ID
  - 403: Unauthorized / You must be a member of the company
  - 404: Job not found
  - 500: Server error

---

## 7. Delete Job (Recruiter)

- **Method**: `DELETE`
- **URL**: `/api/jobs/:id`
- **Authentication**: Required
- **Authorization**: OWNER hoặc MANAGER role của company sở hữu job

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra job tồn tại
3. Kiểm tra permission (OWNER hoặc MANAGER)
4. Xóa job khỏi database (cascade delete salary, benefits, requirements, applications)
5. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 403: Unauthorized / You must be OWNER or MANAGER
  - 404: Job not found
  - 500: Server error

---

## 8. Close Job (Recruiter)

- **Method**: `POST`
- **URL**: `/api/jobs/:id/close`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra job tồn tại
3. Kiểm tra permission (RECRUITER, member của company)
4. Cập nhật job status = INACTIVE
5. Return updated job data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "INACTIVE"
    },
    "message": "Job closed successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 403: Unauthorized / You must be a member of the company
  - 404: Job not found
  - 500: Server error

---

## 9. Repost Job (Recruiter)

- **Method**: `POST`
- **URL**: `/api/jobs/:id/repost`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (optional):
  ```json
  {
    "expiresAt": "2025-02-28T23:59:59.000Z",
    "title": "Updated Title",
    "description": "Updated description"
  }
  ```
  - `publishNow`: boolean (optional, default: false) - **Note:** Hiện tại không được sử dụng, job mới luôn có status = ACTIVE
  - `expiresAt`: string (optional) - Mặc định 30 ngày từ bây giờ nếu không có
  - Các fields khác: optional - để override data từ job cũ (title, description, location, industry, experienceLevel, type, urgent, salary, benefits, requirements)

### Xử lý
1. Validate job ID format
2. Kiểm tra job tồn tại
3. Kiểm tra permission (RECRUITER, member của company)
4. Copy tất cả data từ job cũ (title, description, location, industry, experienceLevel, type, urgent, salary, benefits, requirements)
5. Override với data từ body nếu có
6. Tạo job MỚI (không update job cũ)
7. **Status luôn là ACTIVE**
8. Set expiresAt (từ body hoặc mặc định 30 ngày)
9. Reset applicationCount = 0
10. Return new job data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "status": "ACTIVE",
      "applicationCount": 0
    },
    "message": "Job reposted successfully. New job created."
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid job ID
  - 403: Unauthorized / You must be a member of the company
  - 404: Job not found
  - 500: Server error

---

## 10. Approve Job (Admin Only)

- **Method**: `POST`
- **URL**: `/api/jobs/:id/approve`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra user là ADMIN
3. Kiểm tra job tồn tại
4. Cập nhật job status = ACTIVE
5. Return updated job data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "ACTIVE"
    },
    "message": "Job approved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 403: Unauthorized / Admin access required
  - 404: Job not found
  - 500: Server error

---

## 11. Reject Job (Admin Only)

- **Method**: `POST`
- **URL**: `/api/jobs/:id/reject`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (optional):
  ```json
  {
    "reason": "Job description không đầy đủ"
  }
  ```
  - `reason`: string (optional) - Lý do từ chối

### Xử lý
1. Validate job ID format
2. Kiểm tra user là ADMIN
3. Kiểm tra job tồn tại
4. Cập nhật job status = SUSPENDED
5. Lưu reason nếu có
6. Return updated job data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "SUSPENDED"
    },
    "message": "Job rejected successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 403: Unauthorized / Admin access required
  - 404: Job not found
  - 500: Server error

---

## 12. Save Job (Candidate Only)

- **Method**: `POST`
- **URL**: `/api/jobs/:id/save`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra user role = CANDIDATE
3. Kiểm tra job tồn tại
4. Kiểm tra job chưa được save bởi user
5. Tạo SavedJob record
6. Return saved job data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "jobId": "uuid",
      "job": {...}
    },
    "message": "Job saved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 404: Job not found
  - 409: Job already saved
  - 500: Server error

---

## 13. Unsave Job (Candidate Only)

- **Method**: `DELETE`
- **URL**: `/api/jobs/:id/save`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra user role = CANDIDATE
3. Tìm SavedJob theo jobId và userId
4. Xóa SavedJob record
5. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Job unsaved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 404: Saved job not found
  - 500: Server error

---

## 14. Get Saved Jobs (Candidate Only)

- **Method**: `GET`
- **URL**: `/api/jobs/saved`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10, max: 100)

### Xử lý
1. Kiểm tra user role = CANDIDATE
2. Validate pagination
3. Query saved jobs của user với pagination
4. Return list saved jobs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "savedJobs": [
        {
          "id": "uuid",
          "job": {
            "id": "uuid",
            "title": "Senior Software Engineer",
            "company": {...}
          }
        }
      ],
      "pagination": {
        "total": 10,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid pagination
  - 500: Server error

---

## 15. Get Similar Jobs (Public)

- **Method**: `GET`
- **URL**: `/api/jobs/:id/similar`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Path Parameters**:
  - `id`: string (required, UUID format) - ID của job
- **Query Parameters**:
  - `limit`: number (optional, default: 10, max: 100) - Số lượng similar jobs cần trả về
  - `minSimilarity`: number (optional, default: 0, range: 0-1) - Ngưỡng similarity tối thiểu (0.0 đến 1.0)

### Xử lý
1. Validate job ID format
2. Kiểm tra job tồn tại
3. Query SimilarJob records từ database với jobId
4. Filter theo minSimilarity nếu có
5. Sort theo similarity giảm dần
6. Limit số lượng kết quả
7. Include job details với company, salary, benefits, requirements
8. Return list similar jobs với similarity scores

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "description": "...",
          "location": "Ho Chi Minh City",
          "status": "ACTIVE",
          "similarity": 0.85,
          "company": {
            "id": "uuid",
            "name": "TechCorp Vietnam"
          },
          "salary": {
            "minAmount": 25000000,
            "maxAmount": 40000000,
            "currency": "VND"
          }
        }
      ]
    }
  }
  ```
  **Lưu ý:** Mỗi job trong response có thêm field `similarity` (0.0 đến 1.0) để chỉ độ tương đồng với job gốc.
- **Error Responses**:
  - 400: Invalid job ID format / Invalid limit or minSimilarity
  - 404: Job not found
  - 500: Server error

---

## 16. Get Recommended Jobs (Candidate Only)

- **Method**: `GET`
- **URL**: `/api/jobs/recommended`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: number (optional, default: 10, max: 100) - Number of recommended jobs

### Xử lý
1. Kiểm tra user role = CANDIDATE
2. Validate limit (1-100)
3. Lấy main CV của user (nếu không có CV, trả về jobs mới nhất)
4. Extract skills và experience level từ CV
5. Map CV experience level sang Job experience level (placeholder logic)
6. Tìm jobs phù hợp dựa trên experience level và skills
7. Return list recommended jobs (sorted by relevance - placeholder)

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "description": "...",
          "location": "Ho Chi Minh City",
          "status": "ACTIVE",
          "company": {
            "id": "uuid",
            "name": "TechCorp",
            "logoUrl": "..."
          },
          "salary": {...},
          "benefits": [...],
          "requirements": [...]
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - 400: Limit must be a number between 1 and 100
  - 500: Server error

**Note:** Recommendation algorithm hiện tại là placeholder logic dựa trên experience level và skills từ CV. Có thể được cải thiện với AI/ML trong tương lai.

