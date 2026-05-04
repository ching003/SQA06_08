# JobsConnect - Company API Documentation

## Base URL
```
/api/companies
```

## Authentication
Tất cả endpoints yêu cầu JWT authentication (trừ một số public endpoints). Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Register Company

- **Method**: `POST`
- **URL**: `/api/companies/register`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body** (form-data):
  - `name`: string (required) - Tên công ty
  - `website`: string (optional) - Website công ty
  - `description`: string (optional) - Mô tả công ty
  - `industry`: string (optional) - Ngành nghề
  - `companySize`: enum (optional) - STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
  - `foundedYear`: number (optional) - Năm thành lập
  - `address`: string (optional) - Địa chỉ
  - `phone`: string (optional) - Số điện thoại
  - `email`: string (optional) - Email công ty
  - `logo`: file (optional) - Logo image file (JPEG, PNG, WebP, max 5MB)
  - `document`: file (required) - Giấy chứng nhận công ty (image hoặc PDF, max 10MB)

### Xử lý
1. Validate input (name required, document required)
2. Kiểm tra user chưa có company
3. Kiểm tra company name đã tồn tại chưa
4. Upload logo lên Firebase Storage (nếu có)
5. Upload document lên Firebase Storage (required)
6. Tạo company với status PENDING
7. Tạo CompanyMember với user là OWNER
8. Tạo notification cho tất cả Admin
9. Gửi notification lên Firestore cho Admin
10. Return company data (visibility của một số field phụ thuộc vào role của user gọi API)

### Output
- **Success Response** (201 - ví dụ với ADMIN hoặc member của company, sẽ thấy đủ `members` và `documentUrl`):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "TechCorp Vietnam",
      "website": "https://techcorp.vn",
      "status": "PENDING",
      "logoUrl": "https://...",
      "documentUrl": "https://...",
      "members": [...]
    },
    "message": "Company registered successfully. Waiting for approval."
  }
  ```
- **Lưu ý về visibility theo role**:
  - ADMIN hoặc user là member của company: có thể thấy `members` và `documentUrl`.
  - Candidate hoặc user không phải member: **không** thấy `members` và `documentUrl` trong response (các field này sẽ bị ẩn).
- **Error Responses**:
  - 400: Validation error / Company document is required / Invalid file type / File size exceeds limit
  - 409: User is already a member of a company / Company name already exists
  - 500: Server error

---

## 2. Get Company By ID

- **Method**: `GET`
- **URL**: `/api/companies/:id`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate company ID format
2. Tìm company theo ID
3. Tùy theo role và việc user có phải member của company hay không mà response sẽ có hoặc không có `members` và `documentUrl`.

### Output
- **Success Response** (200 - ví dụ với ADMIN hoặc member của company, sẽ thấy đủ `members` và `documentUrl`):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "TechCorp Vietnam",
      "website": "https://techcorp.vn",
      "description": "Leading technology company",
      "status": "ACTIVE",
      "logoUrl": "https://...",
      "bannerUrl": "https://...",
      "members": [
        {
          "id": "uuid",
          "userId": "uuid",
          "companyRole": "OWNER",
          "user": {
            "id": "uuid",
            "email": "owner@example.com",
            "fullName": "Owner Name"
          }
        }
      ]
    }
  }
  ```
- **Lưu ý về visibility theo role**:
  - ADMIN hoặc user là member của company: có thể thấy `members` và `documentUrl`.
  - Candidate hoặc user không phải member: **không** thấy `members` và `documentUrl` trong response (các field này sẽ bị ẩn).
- **Error Responses**:
  - 400: Invalid company ID format
  - 404: Company not found
  - 500: Server error

---

## 3. Update Company

- **Method**: `PUT`
- **URL**: `/api/companies/:id`
- **Authentication**: Required
- **Authorization**: OWNER hoặc MANAGER role

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (form-data, tất cả optional):
  - `name`: string - Tên công ty
  - `website`: string - Website công ty
  - `description`: string - Mô tả công ty
  - `industry`: string - Ngành nghề
  - `companySize`: enum - STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
  - `foundedYear`: number - Năm thành lập
  - `address`: string - Địa chỉ
  - `phone`: string - Số điện thoại
  - `email`: string - Email công ty
  - `logo`: file - Logo image file mới (JPEG, PNG, WebP, max 5MB)
  - `banner`: file - Banner image file mới (JPEG, PNG, WebP, max 5MB)

### Xử lý
1. Validate company ID format
2. Kiểm tra permission (OWNER hoặc MANAGER)
3. Validate input data
4. Upload logo mới lên Firebase Storage (nếu có) và xóa logo cũ
5. Upload banner mới lên Firebase Storage (nếu có) và xóa banner cũ
6. Cập nhật company trong database
7. Return updated company data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "TechCorp Vietnam Updated",
      "website": "https://techcorp.vn/new",
      "status": "ACTIVE",
      "logoUrl": "https://...",
      "bannerUrl": "https://..."
    },
    "message": "Company updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid company ID / Failed to upload file
  - 403: Unauthorized (không phải OWNER/MANAGER)
  - 404: Company not found
  - 409: Company name already exists
  - 500: Server error

---

## 4. Upload Logo

- **Method**: `PUT`
- **URL**: `/api/companies/:id/logo`
- **Authentication**: Required
- **Authorization**: OWNER, MANAGER, hoặc RECRUITER role

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (form-data):
  - `image`: file (required) - Logo image file (JPEG, PNG, WebP, max 5MB)

### Xử lý
1. Validate company ID format
2. Kiểm tra permission (OWNER, MANAGER, hoặc RECRUITER)
3. Validate file (kiểm tra file tồn tại, file type, file size)
4. Upload logo lên Firebase Storage (dùng companyId làm filename, sẽ ghi đè logo cũ)
5. Xóa logo cũ nếu có
6. Cập nhật logoUrl trong database
7. Return updated company data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "logoUrl": "https://firebasestorage.googleapis.com/..."
    },
    "message": "Logo uploaded successfully"
  }
  ```
- **Error Responses**:
  - 400: No file uploaded / Invalid file type / File size exceeds limit
  - 403: Unauthorized
  - 404: Company not found
  - 500: Server error

---

## 5. Upload Banner

- **Method**: `PUT`
- **URL**: `/api/companies/:id/banner`
- **Authentication**: Required
- **Authorization**: OWNER, MANAGER, hoặc RECRUITER role

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (form-data):
  - `image`: file (required) - Banner image file (JPEG, PNG, WebP, max 5MB)

### Xử lý
1. Validate company ID format
2. Kiểm tra permission (OWNER, MANAGER, hoặc RECRUITER)
3. Validate file (kiểm tra file tồn tại, file type, file size)
4. Upload banner lên Firebase Storage (dùng companyId làm filename, sẽ ghi đè banner cũ)
5. Xóa banner cũ nếu có
6. Cập nhật bannerUrl trong database
7. Return updated company data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "bannerUrl": "https://firebasestorage.googleapis.com/..."
    },
    "message": "Banner uploaded successfully"
  }
  ```
- **Error Responses**:
  - 400: No file uploaded / Invalid file type / File size exceeds limit
  - 403: Unauthorized
  - 404: Company not found
  - 500: Server error

---

## 6. Delete Company

- **Method**: `DELETE`
- **URL**: `/api/companies/:id`
- **Authentication**: Required
- **Authorization**: ADMIN hoặc OWNER role

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate company ID format
2. Kiểm tra permission (ADMIN hoặc OWNER)
3. Xóa company khỏi database (cascade delete members, jobs, etc.)
4. Xóa files trên Firebase Storage (logo, banner, document)
5. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Company deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID format
  - 403: Unauthorized
  - 404: Company not found
  - 500: Server error

---

## 7. Get All Companies

- **Method**: `GET`
- **URL**: `/api/companies`
- **Authentication**: Not Required (có thể gọi public, nếu có token hệ thống vẫn chấp nhận)
- **Authorization**: None

### Input
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
  - `status`: enum (optional) - ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED
  - `size`: enum (optional) - STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
  - `search`: string (optional) - search by name, industry, description
  - `orderBy`: string (optional, default: "createdAt:desc") - format: "field:direction"

### Xử lý
1. Parse query parameters
2. Build where clause (status filter, size filter, search filter)
3. Query companies với pagination
4. Return list companies và pagination info
5. Response **không** bao gồm `members` hoặc `documentUrl` cho mỗi company, kể cả với ADMIN (list view luôn chỉ trả về thông tin cơ bản).

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "TechCorp Vietnam",
        "status": "ACTIVE",
        "industry": "Technology"
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

## 8. Approve Company (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/companies/:id/approve`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate company ID format
2. Kiểm tra user là ADMIN
3. Kiểm tra company tồn tại
4. Kiểm tra company chưa được duyệt
5. Lấy company owner
6. Cập nhật company status = ACTIVE
7. Cập nhật owner role = RECRUITER (nếu chưa phải)
8. Tạo notification cho owner
9. Gửi notification lên Firestore cho owner
10. Return updated company data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "TechCorp Vietnam",
      "status": "ACTIVE"
    },
    "message": "Company approved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID format
  - 403: Unauthorized / Admin access required
  - 404: Company not found
  - 500: Server error

---

## 9. Reject Company (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/companies/:id/reject`
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
    "reason": "Lý do từ chối"
  }
  ```
  - `reason`: string (optional) - Lý do từ chối

### Xử lý
1. Validate company ID format
2. Kiểm tra user là ADMIN
3. Kiểm tra company tồn tại
4. Kiểm tra company chưa được duyệt
5. Lấy company owner
6. Cập nhật company status = SUSPENDED
7. Tạo notification cho owner (có reason nếu có)
8. Gửi notification lên Firestore cho owner
9. Return updated company data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "TechCorp Vietnam",
      "status": "SUSPENDED"
    },
    "message": "Company registration rejected"
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID format / Company has already been approved
  - 403: Unauthorized / Admin access required
  - 404: Company not found
  - 500: Server error

---

## 10. List Members

- **Method**: `GET`
- **URL**: `/api/companies/:id/members`
- **Authentication**: Required
- **Authorization**: Phải là member của company

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate company ID format
2. Kiểm tra user là member của company
3. Lấy danh sách tất cả members của company
4. Return list members với user info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "companyId": "uuid",
        "companyRole": "OWNER",
        "user": {
          "id": "uuid",
          "email": "owner@example.com",
          "fullName": "Owner Name"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID format
  - 403: Unauthorized (không phải member)
  - 404: Company not found
  - 500: Server error

---

## 11. List Invitations

- **Method**: `GET`
- **URL**: `/api/companies/:id/members/invitations`
- **Authentication**: Required
- **Authorization**: OWNER hoặc MANAGER của company

### Input
- **Headers**:
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format) - Company ID
- **Query Parameters**:
  - `status`: enum (optional) - Filter by status: PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED

### Xử lý
1. Validate company ID format
2. Kiểm tra user là OWNER hoặc MANAGER của company
3. Validate status enum nếu có
4. Lấy danh sách invitations của company (với status filter nếu có)
5. Return list invitations với user info và company info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "companyId": "uuid",
        "userId": "uuid",
        "role": "RECRUITER",
        "status": "PENDING",
        "expiresAt": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": "uuid",
          "email": "invited@example.com",
          "fullName": "Invited User"
        },
        "inviter": {
          "id": "uuid",
          "email": "owner@example.com",
          "fullName": "Company Owner"
        }
      }
    ],
    "message": "Invitations retrieved successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID format / Invalid status
  - 403: Unauthorized (không phải member)
  - 404: Company not found
  - 500: Server error

---

## 12. Invite Member

- **Method**: `POST`
- **URL**: `/api/companies/:id/members/invite`
- **Authentication**: Required
- **Authorization**: OWNER hoặc MANAGER role, company phải ACTIVE

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "email": "invited@example.com",
    "role": "RECRUITER"
  }
  ```
  - `email`: string (required) - Email của user được mời
  - `role`: enum (required) - OWNER, MANAGER, RECRUITER, VIEWER

### Xử lý
1. Validate input (email format, role enum)
2. Validate company ID format
3. Kiểm tra permission (OWNER hoặc MANAGER)
4. Kiểm tra company status = ACTIVE
5. Tìm user theo email
6. Kiểm tra user chưa là member của company
7. Kiểm tra user chưa có pending invitation
8. Tạo CompanyMemberInvitation với status PENDING
9. Tạo notification cho user được mời
10. Gửi notification lên Firestore
11. Return invitation data, notification data, user data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "invitation": {
        "id": "uuid",
        "companyId": "uuid",
        "userId": "uuid",
        "role": "RECRUITER",
        "status": "PENDING",
        "expiresAt": "2024-01-08T00:00:00.000Z"
      },
      "notification": {
        "id": "uuid",
        "title": "Lời mời tham gia công ty",
        "message": "..."
      },
      "user": {
        "id": "uuid",
        "email": "invited@example.com"
      },
      "company": {
        "id": "uuid",
        "name": "TechCorp Vietnam"
      }
    },
    "message": "Member invitation sent successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid company ID
  - 403: Unauthorized / Company must be active
  - 404: Company not found / User not found
  - 409: User is already a member / User already has a pending invitation
  - 500: Server error

---

## 13. Accept Invitation

- **Method**: `POST`
- **URL**: `/api/companies/invitations/:invitationId/accept`
- **Authentication**: Required
- **Authorization**: User được mời phải đăng nhập và dùng token của chính họ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `invitationId`: string (required, UUID format)

### Xử lý
1. Validate invitation ID format
2. Tìm invitation theo ID
3. Kiểm tra invitation status = PENDING
4. Kiểm tra invitation chưa hết hạn
5. Kiểm tra user trong token = user được mời
6. Kiểm tra user chưa là member của company
7. Tạo CompanyMember với role từ invitation
8. Cập nhật invitation status = ACCEPTED
9. Xóa notification trong Firestore
10. Tạo notification cho company members
11. Gửi notification lên Firestore cho company
12. Return member data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "companyId": "uuid",
      "companyRole": "RECRUITER"
    },
    "message": "Invitation accepted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invitation ID is required
  - 403: Unauthorized / Invitation expired / Invitation already been accepted/rejected
  - 404: Invitation not found / Company not found
  - 409: User is already a member
  - 500: Server error

---

## 14. Reject Invitation

- **Method**: `POST`
- **URL**: `/api/companies/invitations/:invitationId/reject`
- **Authentication**: Required
- **Authorization**: User được mời (invitation.userId === authenticated user)

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `invitationId`: string (required, UUID format)

### Xử lý
1. Validate invitation ID format
2. Tìm invitation theo ID với details (company, inviter)
3. Kiểm tra invitation thuộc về user đang đăng nhập
4. Kiểm tra invitation status = PENDING
5. Đánh dấu notification gốc đã đọc
6. **Cập nhật invitation status = REJECTED** (giữ lại bản ghi cho history)
7. **Gửi notification cho người mời (inviter)** biết bị từ chối
8. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Invitation rejected successfully"
  }
  ```
- **Error Responses**:
  - 400: Invitation ID is required
  - 403: Unauthorized. This invitation is not for you. / Invitation already been accepted/rejected
  - 404: Invitation not found
  - 500: Server error

### Notification
Khi user từ chối, hệ thống sẽ gửi notification đến **người mời (inviter)**:
- **Type**: `INVITATION_REJECTED`
- **Title**: "Lời mời bị từ chối"
- **Message**: "[Tên user] đã từ chối lời mời tham gia công ty [Tên công ty]"

---

## 15. Cancel Invitation

- **Method**: `DELETE`
- **URL**: `/api/companies/:id/members/invitations/:invitationId`
- **Authentication**: Required
- **Authorization**: OWNER/MANAGER của company hoặc user được mời

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format) - Company ID
  - `invitationId`: string (required, UUID format) - Invitation ID

### Xử lý
1. Validate company ID và invitation ID format
2. Tìm invitation theo ID
3. Kiểm tra permission (OWNER/MANAGER của company hoặc user được mời)
4. Xóa notification trong Firestore (nếu có)
5. Xóa invitation khỏi database (do constraint unique [companyId, userId, status])
6. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Invitation cancelled successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid company ID / Invalid invitation ID
  - 403: Unauthorized
  - 404: Company not found / Invitation not found
  - 500: Server error

---

## 16. Update Member Role

- **Method**: `PUT`
- **URL**: `/api/companies/:id/members/:memberId/role`
- **Authentication**: Required
- **Authorization**: OWNER có thể update bất kỳ ai, MANAGER chỉ update RECRUITER/VIEWER, không thể thay đổi role của OWNER

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format) - Company ID
  - `memberId`: string (required, UUID format) - Member ID
- **Request Body**:
  ```json
  {
    "role": "MANAGER"
  }
  ```
  - `role`: enum (required) - OWNER, MANAGER, RECRUITER, VIEWER

### Xử lý
1. Validate input (role enum)
2. Validate company ID và member ID format
3. Kiểm tra permission (OWNER update được bất kỳ, MANAGER chỉ update RECRUITER/VIEWER)
4. Kiểm tra không thể thay đổi role của OWNER
5. Cập nhật member role trong database
6. Return updated member data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "companyId": "uuid",
      "companyRole": "MANAGER"
    },
    "message": "Member role updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid IDs
  - 403: Unauthorized / Cannot change OWNER role
  - 404: Company not found / Member not found
  - 500: Server error

---

## 17. Delete Member

- **Method**: `DELETE`
- **URL**: `/api/companies/:id/members/:memberId`
- **Authentication**: Required
- **Authorization**: OWNER hoặc MANAGER có thể xóa, không thể xóa OWNER, MANAGER không thể xóa MANAGER khác

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format) - Company ID
  - `memberId`: string (required, UUID format) - Member ID

### Xử lý
1. Validate company ID và member ID format
2. Kiểm tra permission (OWNER hoặc MANAGER)
3. Kiểm tra không thể xóa OWNER
4. Kiểm tra MANAGER không thể xóa MANAGER khác
5. Xóa member khỏi database
6. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Member removed successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid IDs
  - 403: Unauthorized / Cannot delete OWNER / Cannot delete MANAGER
  - 404: Company not found / Member not found
  - 500: Server error

