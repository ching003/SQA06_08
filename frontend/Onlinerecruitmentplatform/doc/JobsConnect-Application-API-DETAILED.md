# JobsConnect - Application API Documentation

## Base URL
```
/api/applications
```

## Authentication
Tất cả endpoints yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Apply for Job

- **Method**: `POST`
- **URL**: `/api/applications`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "jobId": "uuid",
    "cvId": "uuid",
    "coverLetter": "I am very interested in this position..."
  }
  ```
  - `jobId`: string (required, UUID format) - ID của job muốn apply
  - `cvId`: string (required, UUID format) - ID của CV dùng để apply (phải thuộc về user)
  - `coverLetter`: string (optional, max 5000 chars) - Thư xin việc

### Xử lý
1. Validate input (jobId, cvId required, coverLetter max length)
2. Kiểm tra user tồn tại
3. Kiểm tra job tồn tại và status = ACTIVE
4. Kiểm tra job chưa hết hạn (expiresAt)
5. Kiểm tra CV tồn tại và thuộc về user
6. Kiểm tra user chưa có application ACTIVE cho job này (PENDING, REVIEWING, ACCEPTED)
7. Tạo application với status = PENDING
8. Tăng applicationCount của job
9. Gửi notification vào Firestore collection của company (tất cả members OWNER/MANAGER/RECRUITER đều thấy)
10. Tạo notification trong database cho từng member
11. Tạo status tracking trong Firestore cho từng member
12. Return application data với relations (job, CV, user)

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "jobId": "uuid",
      "cvId": "uuid",
      "coverLetter": "I am very interested...",
      "status": "PENDING",
      "job": {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": {...}
      },
      "cv": {...},
      "user": {...}
    },
    "message": "Application submitted successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Job is not active / Job has expired / You have already applied for this job
  - 403: CV does not belong to this user
  - 404: User not found / Job not found / CV not found
  - 500: Server error

---

## 2. Get My Applications

- **Method**: `GET`
- **URL**: `/api/applications/my`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`

### Xử lý
1. Lấy userId từ authenticated user
2. Query tất cả applications của user với relations (job, CV)
3. Return list applications

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "status": "PENDING",
        "coverLetter": "...",
        "job": {
          "id": "uuid",
          "title": "Senior Software Engineer",
          "company": {...}
        },
        "cv": {
          "id": "uuid",
          "title": "My Professional CV"
        }
      }
    ],
    "message": "Applications retrieved successfully"
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 3. Get Application Details

- **Method**: `GET`
- **URL**: `/api/applications/:id`
- **Authentication**: Required
- **Authorization**: Candidate xem được applications của mình, Recruiter xem được applications của jobs trong company của họ, Admin xem được tất cả

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate application ID format
2. Tìm application theo ID với tất cả relations (job với company, CV với nested data, user)
3. Kiểm tra permission:
   - ADMIN: xem được tất cả
   - CANDIDATE: chỉ xem được của mình
   - RECRUITER/MANAGER/OWNER: chỉ xem được applications của jobs trong company của họ
4. Return application data với full nested data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "PENDING",
      "coverLetter": "...",
      "notes": "...",
      "job": {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "description": "...",
        "company": {
          "id": "uuid",
          "name": "TechCorp Vietnam"
        },
        "salary": {...},
        "benefits": [...],
        "requirements": [...]
      },
      "cv": {
        "id": "uuid",
        "title": "My Professional CV",
        "educations": [...],
        "workExperiences": [...],
        "skills": [...]
      },
      "user": {
        "id": "uuid",
        "email": "candidate@example.com",
        "fullName": "Candidate Name"
      }
    },
    "message": "Application retrieved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid application ID format
  - 403: Unauthorized / You can only view your own applications / You can only view applications for jobs in your company
  - 404: Application not found
  - 500: Server error

---

## 4. Get Applications by Job (Recruiter)

- **Method**: `GET`
- **URL**: `/api/jobs/:jobId/applications`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company sở hữu job

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `jobId`: string (required, UUID format)

### Xử lý
1. Validate job ID format
2. Kiểm tra job tồn tại
3. Kiểm tra user là member của company sở hữu job
4. Query tất cả applications của job với relations (user, CV summary - không có full nested data)
5. Return list applications

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "status": "PENDING",
        "coverLetter": "...",
        "user": {
          "id": "uuid",
          "email": "candidate@example.com",
          "fullName": "Candidate Name"
        },
        "cv": {
          "id": "uuid",
          "title": "My Professional CV",
          "currentPosition": "Senior Software Engineer"
        }
      }
    ],
    "message": "Applications retrieved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid job ID format
  - 403: Unauthorized / You must be a member of the company that owns this job
  - 404: Job not found
  - 500: Server error

---

## 5. Update Application Status (Recruiter)

- **Method**: `PATCH`
- **URL**: `/api/applications/:id/status`
- **Authentication**: Required
- **Authorization**: RECRUITER role, phải là member của company sở hữu job

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "status": "REVIEWING",
    "notes": "Candidate has strong technical background. Schedule interview."
  }
  ```
  - `status`: enum (required) - PENDING, REVIEWING, ACCEPTED, REJECTED, CANCELLED
  - `notes`: string (optional, max 2000 chars) - Ghi chú nội bộ

### Xử lý
1. Validate application ID format
2. Validate input (status enum, notes max length)
3. Kiểm tra application tồn tại
4. Kiểm tra permission (user là member của company sở hữu job)
5. Kiểm tra status hợp lệ
6. Cập nhật application status và notes
7. Tạo notification trong database cho candidate
8. Gửi notification lên Firestore cho candidate (real-time push)
9. Return updated application data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "REVIEWING",
      "notes": "Candidate has strong technical background...",
      "job": {...},
      "cv": {...},
      "user": {...}
    },
    "message": "Application status updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid application ID / Invalid status
  - 403: Unauthorized / You must be a member of the company that owns this job
  - 404: Application not found
  - 500: Server error

---

## 6. Withdraw Application

- **Method**: `PATCH`
- **URL**: `/api/applications/:id/withdraw`
- **Authentication**: Required
- **Authorization**: CANDIDATE role only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate application ID format
2. Kiểm tra application tồn tại
3. Kiểm tra application thuộc về user
4. Kiểm tra status cho phép withdraw (chỉ PENDING hoặc REVIEWING)
5. Cập nhật application status = CANCELLED
6. Return updated application data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "CANCELLED",
      "job": {...},
      "cv": {...}
    },
    "message": "Application withdrawn successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid application ID format / Cannot withdraw application with status ACCEPTED or REJECTED
  - 403: Unauthorized / You can only withdraw your own applications
  - 404: Application not found
  - 500: Server error

