# JobsConnect - CV API Documentation

## Base URL
```
/api/cvs
```

## Authentication
Tất cả endpoints yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Create CV

- **Method**: `POST`
- **URL**: `/api/cvs`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "My Professional CV",
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "phoneNumber": "0123456789",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": "123 Main Street",
    "currentPosition": "Senior Software Engineer",
    "summary": "Experienced software engineer...",
    "objective": "Seeking a challenging position...",
    "isOpenForJob": true,
    "templateId": "uuid",
    "educations": [
      {
        "institution": "University",
        "degree": "Bachelor",
        "startDate": "2010-09-01",
        "endDate": "2014-06-30",
        "description": "Graduated with honors"
      }
    ],
    "workExperiences": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "startDate": "2019-01-01",
        "endDate": null,
        "description": "Lead development..."
      }
    ],
    "skills": [
      {
        "skillName": "JavaScript",
        "level": "EXPERT",
        "yearsOfExperience": 5
      }
    ],
    "projects": [...],
    "certifications": [...],
    "languages": [...],
    "achievements": [...],
    "activities": [...],
    "references": [...]
  }
  ```
  - `title`: string (required, min 3 chars)
  - `fullName`, `email`, `phoneNumber`, `dateOfBirth`, `gender`, `address`, `currentPosition`, `summary`, `objective`: optional
  - `isOpenForJob`: boolean (optional, default: false)
  - `templateId`: string (optional, UUID) - Link CV với CV Template
  - Nested arrays (educations, workExperiences, skills, etc.): optional

### Xử lý
1. Validate input (title required, email format nếu có)
2. Lấy userId từ authenticated user
3. Tạo CV với nested data (educations, workExperiences, skills, etc.)
4. Nếu isMain = true, unset isMain cho các CV khác của user
5. **Nếu có templateId, tự động generate PDF và upload lên Firebase Storage, lưu URL vào pdfUrl**
6. Return CV data với tất cả nested relations (bao gồm pdfUrl nếu đã generate)

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "My Professional CV",
      "fullName": "Nguyen Van A",
      "isMain": false,
      "templateId": "uuid",
      "template": {...},
      "educations": [...],
      "workExperiences": [...],
      "skills": [...]
    },
    "message": "CV created successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / User not found / Invalid email format
  - 500: Server error

---

## 2. Get CV By ID

- **Method**: `GET`
- **URL**: `/api/cvs/:id`
- **Authentication**: Required
- **Authorization**: User xem được CV của mình, RECRUITER/ADMIN xem được tất cả

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate CV ID format
2. Tìm CV theo ID với tất cả nested relations
3. Kiểm tra permission (user xem được của mình, RECRUITER/ADMIN xem được tất cả)
4. Return CV data với nested data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "My Professional CV",
      "fullName": "Nguyen Van A",
      "educations": [...],
      "workExperiences": [...],
      "skills": [...],
      "template": {...}
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format
  - 403: You do not have permission to view this CV
  - 404: CV not found
  - 500: Server error

---

## 3. Get All CVs

- **Method**: `GET`
- **URL**: `/api/cvs`
- **Authentication**: Required
- **Authorization**: Non-admin users chỉ thấy CVs của mình, ADMIN/RECRUITER thấy tất cả

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
  - `userId`: string (optional, UUID) - Chỉ ADMIN/RECRUITER có thể filter
  - `isOpenForJob`: boolean (optional) - Filter CVs open for job
  - `orderBy`: string (optional, default: "createdAt:desc") - format: "field:direction"

### Xử lý
1. Parse query parameters
2. Kiểm tra permission (non-admin chỉ thấy của mình)
3. Build where clause (userId filter, isOpenForJob filter)
4. Query CVs với pagination
5. Return list CVs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "My Professional CV",
        "isMain": true,
        "isOpenForJob": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 4. Get CVs By User

- **Method**: `GET`
- **URL**: `/api/cvs/user/:userId`
- **Authentication**: Required
- **Authorization**: User xem được CVs của mình, RECRUITER/ADMIN xem được tất cả

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `userId`: string (required, UUID format)

### Xử lý
1. Validate user ID format
2. Kiểm tra permission (user xem được của mình, RECRUITER/ADMIN xem được tất cả)
3. Lấy tất cả CVs của user
4. Return list CVs

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "My Professional CV",
        "isMain": true
      }
    ]
  }
  ```
- **Error Responses**:
  - 400: Invalid user ID format
  - 403: You do not have permission to view this user's CVs
  - 404: User not found
  - 500: Server error

---

## 5. Update CV

- **Method**: `PUT`
- **URL**: `/api/cvs/:id`
- **Authentication**: Required
- **Authorization**: User update được CV của mình, ADMIN update được bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (tất cả optional):
  ```json
  {
    "title": "Updated Professional CV",
    "fullName": "Nguyen Van A Updated",
    "currentPosition": "Lead Software Engineer",
    "templateId": "uuid",
    "skills": [
      {
        "skillName": "JavaScript",
        "level": "EXPERT",
        "yearsOfExperience": 6
      }
    ]
  }
  ```
  - Có thể update nested data (skills, educations, etc.) - sẽ delete all và recreate

### Xử lý
1. Validate CV ID format
2. Validate update data
3. Kiểm tra permission (user update được của mình, ADMIN update được bất kỳ)
4. Xử lý nested updates (delete all và recreate nếu có)
5. Cập nhật CV trong database
6. Return updated CV data với nested relations

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Updated Professional CV",
      "skills": [...]
    },
    "message": "CV updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid CV ID / Invalid email format
  - 403: You do not have permission to update this CV
  - 500: Server error

---

## 6. Set CV As Main

- **Method**: `PUT`
- **URL**: `/api/cvs/:id/main`
- **Authentication**: Required
- **Authorization**: User set được CV của mình, ADMIN set được bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate CV ID format
2. Kiểm tra permission (user set được của mình, ADMIN set được bất kỳ)
3. Unset isMain cho tất cả CVs khác của user
4. Set isMain = true cho CV này
5. Return updated CV data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "My Professional CV",
      "isMain": true
    },
    "message": "CV set as main successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format
  - 403: You do not have permission to set this CV as main
  - 404: CV not found
  - 500: Server error

---

## 7. Delete CV

- **Method**: `DELETE`
- **URL**: `/api/cvs/:id`
- **Authentication**: Required
- **Authorization**: User delete được CV của mình, ADMIN delete được bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate CV ID format
2. Kiểm tra permission (user delete được của mình, ADMIN delete được bất kỳ)
3. Kiểm tra CV không có Application (nếu có thì không cho xóa)
4. Xóa CV khỏi database (cascade delete nested data)
5. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "CV deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format / Cannot delete CV that has applications
  - 403: You do not have permission to delete this CV
  - 404: CV not found
  - 500: Server error

---

## 8. Search CVs (Recruiter/Admin Only)

- **Method**: `GET`
- **URL**: `/api/cvs/search`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `query`: string (optional, default: '') - Search query (searches in title, summary, skills, etc.)
  - `skills`: string or array (optional) - Filter by skills. Nếu là string, có thể là comma-separated hoặc single value. Backend sẽ convert thành array.
  - `location`: string (optional) - Filter by location
  - `educationLevel`: string (optional) - Filter by education level
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)

### Xử lý
1. Kiểm tra permission (chỉ RECRUITER và ADMIN)
2. Parse query parameters
3. Build search filters:
   - `query`: Text search (default: empty string)
   - `skills`: Convert to array nếu là string
   - `location`, `educationLevel`: Exact match
4. Search CVs với text search (vector similarity có thể được thêm trong tương lai)
5. Return list CVs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "My Professional CV",
        "fullName": "Nguyen Van A",
        "skills": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
  ```
- **Error Responses**:
  - 403: Only recruiters and admins can search CVs
  - 500: Server error

---

## 9. Get Recommended CVs for Job (Recruiter/Admin Only)

- **Method**: `GET`
- **URL**: `/api/jobs/:jobId/recommended-cvs`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `jobId`: string (required, UUID format)
- **Query Parameters**:
  - `limit`: number (optional, default: 10) - Number of recommended CVs

### Xử lý
1. Kiểm tra permission (chỉ RECRUITER và ADMIN)
2. Validate job ID format
3. Tìm job theo ID
4. Tính similarity giữa job embedding và CV embeddings
5. Lấy top CVs có similarity cao nhất
6. Return list recommended CVs

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "My Professional CV",
        "fullName": "Nguyen Van A",
        "skills": [...],
        "workExperiences": [...],
        "educations": [...]
      }
    ]
  }
  ```
  **Lưu ý:** Response không có `similarity` score (có thể được thêm trong tương lai với AI/ML recommendation)
- **Error Responses**:
  - 403: Only recruiters and admins can get recommended CVs
  - 404: Job not found
  - 500: Server error

---

## 10. Export CV

- **Method**: `POST`
- **URL**: `/api/cvs/:id/export`
- **Authentication**: Required
- **Authorization**: User export được CV của mình, ADMIN export được bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (optional):
  ```json
  {
    "templateId": "uuid",
    "forceRegenerate": false
  }
  ```
  - `templateId`: string (optional, UUID) - Nếu không có, dùng CV.templateId
  - `forceRegenerate`: boolean (optional, default: false) - Force regenerate PDF ngay cả khi đã có pdfUrl

### Xử lý
1. Validate CV ID format
2. Kiểm tra permission (user export được của mình, ADMIN export được bất kỳ)
3. Tìm CV với tất cả nested data
4. Tìm template (từ templateId hoặc CV.templateId)
5. Kiểm tra template isActive
6. **Nếu CV đã có pdfUrl và không forceRegenerate: download PDF từ Firebase Storage và return**
7. **Nếu chưa có pdfUrl hoặc forceRegenerate = true:**
   - Render CV data vào template HTML
   - Generate PDF từ HTML
   - Upload PDF lên Firebase Storage
   - Lưu pdfUrl vào CV
   - Download PDF từ storage và return buffer

### Output
- **Success Response** (200):
  - Content-Type: `application/pdf`
  - Headers:
    - `Content-Disposition: attachment; filename="cv-{id}.pdf"`
    - `Content-Length: {size}`
  - Body: PDF file binary data
- **Error Responses**:
  - 400: Invalid CV ID / Template not found / Template is not active / Template ID is required
  - 403: You do not have permission to export this CV
  - 500: Server error / Failed to export CV

---

## 11. Save CV (Recruiter Only)

- **Method**: `POST`
- **URL**: `/api/cvs/:id/save`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format) - CV ID cần lưu
- **Request Body** (optional):
  ```json
  {
    "notes": "Ứng viên tiềm năng cho vị trí Senior Developer"
  }
  ```
  - `notes`: string (optional) - Ghi chú về CV

### Xử lý
1. Validate CV ID format
2. Kiểm tra CV tồn tại
3. Kiểm tra user là recruiter (có trong CompanyMember)
4. Kiểm tra không phải CV của chính mình
5. Kiểm tra CV chưa được lưu
6. Tạo SavedCV record
7. Return SavedCV với CV data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "recruiter-uuid",
      "cvId": "cv-uuid",
      "notes": "Ứng viên tiềm năng...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "cv": {
        "id": "cv-uuid",
        "title": "My Professional CV",
        "fullName": "Nguyen Van A",
        "user": {...},
        "skills": [...],
        "workExperiences": [...]
      }
    },
    "message": "CV saved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID / Cannot save your own CV / CV already saved / Unauthorized. Only recruiters can save CVs.
  - 404: CV not found
  - 500: Server error

---

## 12. Unsave CV (Recruiter Only)

- **Method**: `DELETE`
- **URL**: `/api/cvs/:id/save`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format) - CV ID cần bỏ lưu

### Xử lý
1. Validate CV ID format
2. Kiểm tra SavedCV tồn tại (với userId và cvId)
3. Xóa SavedCV record
4. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "CV unsaved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format
  - 404: Saved CV not found
  - 500: Server error

---

## 13. Get Saved CVs (Recruiter Only)

- **Method**: `GET`
- **URL**: `/api/cvs/saved`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)

### Xử lý
1. Kiểm tra user là recruiter (có trong CompanyMember)
2. Lấy danh sách SavedCVs của user với pagination
3. Include CV data với user, skills, workExperiences, educations
4. Return list SavedCVs và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "recruiter-uuid",
        "cvId": "cv-uuid",
        "notes": "Ứng viên tiềm năng...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "cv": {
          "id": "cv-uuid",
          "title": "My Professional CV",
          "fullName": "Nguyen Van A",
          "user": {
            "id": "user-uuid",
            "email": "user@example.com",
            "fullName": "Nguyen Van A",
            "avatarUrl": "..."
          },
          "skills": [...],
          "workExperiences": [...],
          "educations": [...]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
  ```
- **Error Responses**:
  - 403: Unauthorized. Only recruiters can view saved CVs.
  - 500: Server error

---

## 14. Update Saved CV Notes (Recruiter Only)

- **Method**: `PUT`
- **URL**: `/api/cvs/:id/save/notes`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format) - CV ID
- **Request Body**:
  ```json
  {
    "notes": "Cập nhật: Đã phỏng vấn vòng 1, kết quả tốt"
  }
  ```
  - `notes`: string (optional) - Ghi chú mới. Có thể là empty string để xóa notes.

### Xử lý
1. Validate CV ID format
2. Kiểm tra SavedCV tồn tại (với userId và cvId)
3. Cập nhật notes
4. Return updated SavedCV

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "recruiter-uuid",
      "cvId": "cv-uuid",
      "notes": "Cập nhật: Đã phỏng vấn vòng 1, kết quả tốt",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    },
    "message": "Notes updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format
  - 404: Saved CV not found
  - 500: Server error

---

## 15. Check CV Saved (Recruiter Only)

- **Method**: `GET`
- **URL**: `/api/cvs/:id/saved`
- **Authentication**: Required
- **Authorization**: RECRUITER hoặc ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format) - CV ID cần kiểm tra

### Xử lý
1. Validate CV ID format
2. Kiểm tra xem CV có trong danh sách SavedCV của user không
3. Return boolean result

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "isSaved": true
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid CV ID format
  - 500: Server error

