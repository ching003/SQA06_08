# JobsConnect - User API Documentation

## Base URL
```
/api/users
```

## Authentication
Hầu hết endpoints yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Register User

- **Method**: `POST`
- **URL**: `/api/users/register`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "role": "CANDIDATE",
    "phoneNumber": "0123456789",
    "gender": "MALE",
    "dateOfBirth": "1990-01-01"
  }
  ```
  - `email`: string (required, unique)
  - `password`: string (required, min 8 chars)
  - `fullName`: string (optional)
  - `role`: enum (optional, default: CANDIDATE) - CANDIDATE, RECRUITER, ADMIN
  - `phoneNumber`: string (optional)
  - `gender`: enum (optional) - MALE, FEMALE, OTHER
  - `dateOfBirth`: string (optional, ISO date format)

### Xử lý
1. Validate input (email format, password length, role enum)
2. Kiểm tra email đã tồn tại chưa
3. Hash password bằng bcrypt
4. Tạo user mới trong database với status ACTIVE
5. Return user data (không bao gồm passwordHash)

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CANDIDATE",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User registered successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error (invalid email, password too short, etc.)
  - 409: Email already exists
  - 500: Server error

---

## 2. Login

- **Method**: `POST`
- **URL**: `/api/users/login`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  - `email`: string (required)
  - `password`: string (required)

### Xử lý
1. Validate input (email format, password required)
2. Tìm user theo email
3. Kiểm tra account status (phải ACTIVE)
4. Verify password bằng bcrypt
5. Cập nhật lastLoginAt
6. Generate JWT token (expires in 7 days)
7. Return user data và token

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "CANDIDATE"
      },
      "token": "jwt-token-here",
      "expiresIn": 604800
    },
    "message": "Login successful"
  }
  ```
  - **Lưu ý**: `expiresIn` là số giây (604800 = 7 ngày)
- **Error Responses**:
  - 400: Validation error
  - 401: Invalid email or password / Account is locked
  - 500: Server error

---

## 3. Logout

- **Method**: `POST`
- **URL**: `/api/users/logout`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`

### Xử lý
1. JWT là stateless, logout được xử lý client-side bằng cách xóa token
2. Optionally có thể maintain blacklist của tokens (chưa implement)

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 4. Get User By ID

- **Method**: `GET`
- **URL**: `/api/users/:id`
- **Authentication**: Required
- **Authorization**: User có thể xem profile của chính mình, ADMIN và RECRUITER có thể xem tất cả

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate user ID format
2. Kiểm tra permission:
   - User có thể xem profile của chính mình (`userId === id`)
   - ADMIN có thể xem tất cả
   - RECRUITER có thể xem tất cả
   - CANDIDATE không thể xem profile của user khác
3. Tìm user theo ID trong database
4. Filter companyMember dựa trên role của viewer:
   - Nếu viewer là chính user đó → hiển thị companyMember
   - Nếu viewer là ADMIN hoặc RECRUITER → hiển thị companyMember
   - Nếu viewer là CANDIDATE xem profile khác → ẩn companyMember
5. Return user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CANDIDATE",
      "status": "ACTIVE",
      "companyMember": {
        "id": "uuid",
        "companyId": "uuid",
        "companyRole": "OWNER",
        "status": "ACTIVE",
        "company": {
          "id": "uuid",
          "name": "TechCorp"
        }
      }
    }
  }
  ```
  **Lưu ý:** `companyMember` chỉ hiển thị nếu:
  - Viewer là chính user đó, hoặc
  - Viewer là ADMIN/RECRUITER

- **Error Responses**:
  - 400: Invalid user ID format
  - 403: You do not have permission to view this user's profile
  - 404: User not found
  - 500: Server error

---

## 5. Get User Info

- **Method**: `GET`
- **URL**: `/api/users/:id/info`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Tìm user theo ID
2. Return thông tin chi tiết user (bao gồm các relations nếu có)

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "phoneNumber": "0123456789",
      "gender": "MALE",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "role": "CANDIDATE",
      "status": "ACTIVE",
      "avatarUrl": "https://...",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - 404: User not found
  - 500: Server error

---

## 6. Get User Age

- **Method**: `GET`
- **URL**: `/api/users/:id/age`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Tìm user theo ID
2. Kiểm tra dateOfBirth có tồn tại không
3. Tính tuổi từ dateOfBirth
4. Return age

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "age": 34
    }
  }
  ```
- **Error Responses**:
  - 404: User not found / Date of birth is not set
  - 500: Server error

---

## 7. Update Profile

- **Method**: `PUT`
- **URL**: `/api/users/:id/profile`
- **Authentication**: Required
- **Authorization**: User chỉ có thể update profile của chính mình, Admin có thể update bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "fullName": "Updated Name",
    "phoneNumber": "0987654321",
    "gender": "FEMALE",
    "dateOfBirth": "1995-05-15"
  }
  ```
  - Tất cả fields đều optional
  - **Lưu ý**: Để update avatar, sử dụng API riêng: `POST /api/users/:id/avatar`

### Xử lý
1. Validate user ID format
2. Kiểm tra permission (user chỉ update được của mình, admin update được bất kỳ)
3. Validate input data
4. Cập nhật user profile trong database
5. Return updated user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Updated Name",
      "phoneNumber": "0987654321",
      "gender": "FEMALE",
      "dateOfBirth": "1995-05-15T00:00:00.000Z"
    },
    "message": "Profile updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid user ID
  - 403: You can only update your own profile
  - 404: User not found
  - 500: Server error

---

## 8. Change Password

- **Method**: `PUT`
- **URL**: `/api/users/:id/password`
- **Authentication**: Required
- **Authorization**: User chỉ có thể đổi mật khẩu của chính mình

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "oldPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }
  ```
  - `oldPassword`: string (required)
  - `newPassword`: string (required, min 8 chars)

### Xử lý
1. Validate user ID format
2. Kiểm tra permission (user chỉ đổi được của mình)
3. Validate input (oldPassword, newPassword required, newPassword min 8 chars)
4. Verify oldPassword với passwordHash trong database
5. Hash newPassword
6. Cập nhật passwordHash trong database
7. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Old password is incorrect / User not found
  - 403: You can only change your own password
  - 500: Server error

---

## 9. Upload Avatar

- **Method**: `POST`
- **URL**: `/api/users/:id/avatar`
- **Authentication**: Required
- **Authorization**: User chỉ có thể upload avatar của chính mình, Admin có thể upload bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (form-data):
  - `avatar`: file (required, image file - JPEG, PNG, WebP, max 5MB)

### Xử lý
1. Kiểm tra permission (user chỉ upload được của mình, admin upload được bất kỳ)
2. Validate file (kiểm tra file tồn tại, file type, file size)
3. Upload file lên Firebase Storage
4. Xóa avatar cũ nếu có
5. Cập nhật avatarUrl trong database
6. Return avatarUrl

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "avatarUrl": "https://firebasestorage.googleapis.com/..."
    },
    "message": "Avatar uploaded successfully"
  }
  ```
- **Error Responses**:
  - 400: No file uploaded / Invalid file type / File size exceeds limit
  - 403: You can only upload your own avatar
  - 404: User not found
  - 500: Server error

---

## 10. Update Status

- **Method**: `PUT`
- **URL**: `/api/users/:id/status`
- **Authentication**: Required
- **Authorization**: User chỉ có thể update status của chính mình, Admin có thể update bất kỳ

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "status": "ACTIVE"
  }
  ```
  - `status`: enum string (required) - ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED

### Xử lý
1. Kiểm tra permission (user chỉ update được của mình, admin update được bất kỳ)
2. Validate status enum
3. Cập nhật status trong database
4. Return updated user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "ACTIVE"
    },
    "message": "User status updated to ACTIVE successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid status enum
  - 403: You can only update your own status
  - 404: User not found
  - 500: Server error

---

## 11. Get All Users (Admin Only)

- **Method**: `GET`
- **URL**: `/api/users`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
  - `role`: enum (optional) - CANDIDATE, RECRUITER, ADMIN
  - `search`: string (optional) - search by email or fullName
  - `orderBy`: string (optional, default: "createdAt:desc") - format: "field:direction"

### Xử lý
1. Parse query parameters (page, limit, role, search, orderBy)
2. Build where clause (role filter, search filter)
3. Query users với pagination (include companyMember relation)
4. Filter companyMember: ADMIN có thể thấy companyMember của tất cả users
5. Return list users và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "CANDIDATE",
        "status": "ACTIVE",
        "companyMember": {
          "id": "uuid",
          "companyId": "uuid",
          "companyRole": "OWNER",
          "status": "ACTIVE",
          "company": {
            "id": "uuid",
            "name": "TechCorp"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
  ```
  **Lưu ý:** `companyMember` chỉ hiển thị nếu user là member của một company. ADMIN có thể thấy companyMember của tất cả users.
- **Error Responses**:
  - 500: Server error

---

## 12. Create User (Admin Only)

- **Method**: `POST`
- **URL**: `/api/users`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "admin-created@example.com",
    "password": "password123",
    "fullName": "Admin Created User",
    "role": "CANDIDATE",
    "status": "ACTIVE"
  }
  ```
  - `email`: string (required, unique)
  - `password`: string (required, min 8 chars, plain text - backend sẽ hash tự động)
  - `fullName`: string (optional)
  - `role`: enum (optional, default: CANDIDATE)
  - `status`: enum string (optional, default: ACTIVE) - ACTIVE, INACTIVE, LOCKED, PENDING, SUSPENDED

### Xử lý
1. Validate input (email format, password required, role enum, status enum)
2. Kiểm tra email đã tồn tại chưa
3. Hash password bằng bcrypt
4. Tạo user mới trong database
5. Return user data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "admin-created@example.com",
      "fullName": "Admin Created User",
      "role": "CANDIDATE",
      "status": "ACTIVE"
    },
    "message": "User created successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Password is required
  - 409: Email already exists
  - 500: Server error

---

## 13. Update User (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/users/:id`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body**:
  ```json
  {
    "fullName": "Updated by Admin",
    "role": "RECRUITER"
  }
  ```
  - Tất cả fields đều optional (fullName, role, email, status, etc.)

### Xử lý
1. Validate user ID format
2. Validate input data
3. Kiểm tra email mới có trùng không (nếu có thay đổi email)
4. Cập nhật user trong database
5. Return updated user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Updated by Admin",
      "role": "RECRUITER"
    },
    "message": "User updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid user ID
  - 404: User not found
  - 409: Email already exists
  - 500: Server error

---

## 14. Delete User (Admin Only)

- **Method**: `DELETE`
- **URL**: `/api/users/:id`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate user ID format
2. Kiểm tra user có tồn tại không
3. Xóa user khỏi database (cascade delete các relations)
4. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid user ID format
  - 404: User not found
  - 500: Server error

---

## 15. Lock Account (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/users/:id/lock`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Kiểm tra user có tồn tại không
2. Set status = LOCKED
3. Return updated user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "LOCKED"
    },
    "message": "Account locked successfully"
  }
  ```
- **Error Responses**:
  - 403: Unauthorized (không phải admin)
  - 404: User not found
  - 500: Server error

---

## 16. Unlock Account (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/users/:id/unlock`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Kiểm tra user có tồn tại không
2. Set status = ACTIVE
3. Return updated user data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "ACTIVE"
    },
    "message": "Account unlocked successfully"
  }
  ```
- **Error Responses**:
  - 403: Unauthorized (không phải admin)
  - 404: User not found
  - 500: Server error

