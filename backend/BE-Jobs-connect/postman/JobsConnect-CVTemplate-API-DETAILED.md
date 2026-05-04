# JobsConnect - CVTemplate API Documentation

## Base URL
```
/api/cv-templates
```

## Authentication
Hầu hết endpoints yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get Active Templates (Public)

- **Method**: `GET`
- **URL**: `/api/cv-templates/active`
- **Authentication**: Not Required
- **Authorization**: None

### Input
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)

### Xử lý
1. Parse query parameters
2. Query templates với isActive = true
3. Return list active templates với pagination

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Modern Template",
        "htmlUrl": "https://...",
        "previewUrl": "https://...",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 2. Get All Templates

- **Method**: `GET`
- **URL**: `/api/cv-templates`
- **Authentication**: Required
- **Authorization**: Authenticated user (bất kỳ user đã đăng nhập)

### Input
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
  - `isActive`: boolean (optional) - Filter by active status

### Xử lý
1. Kiểm tra user đã đăng nhập
2. Parse query parameters
3. Build where clause (isActive filter)
4. Query templates với pagination (default: createdAt desc)
5. Return list templates và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Modern Template",
        "htmlUrl": "https://...",
        "previewUrl": "https://...",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 3. Get Template By ID

- **Method**: `GET`
- **URL**: `/api/cv-templates/:id`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate template ID format
2. Tìm template theo ID
3. Return template data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Modern Template",
      "htmlUrl": "https://...",
      "previewUrl": "https://...",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid template ID format
  - 404: Template not found
  - 500: Server error

---

## 4. Create Template (Admin Only)

- **Method**: `POST`
- **URL**: `/api/cv-templates`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body** (form-data):
  - `name`: string (required) - Template name
  - `template`: file (optional) - HTML template file
  - `htmlUrl`: string (optional) - HTML URL (nếu không upload file)
  - `preview`: file (optional) - Preview image file
  - `previewUrl`: string (optional) - Preview image URL (nếu không upload file)
  - `isActive`: boolean (optional, default: true)

### Xử lý
1. Validate input (name required, phải có template file hoặc htmlUrl)
2. Kiểm tra template name đã tồn tại chưa
3. Upload template file lên Firebase Storage (nếu có) và lấy URL
4. Upload preview file lên Firebase Storage (nếu có) và lấy URL
5. Tạo template trong database
6. Return template data

### Output
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "New Template",
      "htmlUrl": "https://...",
      "previewUrl": "https://...",
      "isActive": true
    },
    "message": "Template created successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Either template file or htmlUrl is required / Invalid file type
  - 409: Template name already exists
  - 500: Server error

---

## 5. Update Template (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/cv-templates/:id`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters**:
  - `id`: string (required, UUID format)
- **Request Body** (form-data, tất cả optional):
  - `name`: string - Template name
  - `template`: file - New HTML template file
  - `htmlUrl`: string - New HTML URL
  - `preview`: file - New preview image file
  - `previewUrl`: string - New preview image URL
  - `isActive`: boolean - Is template active

### Xử lý
1. Validate template ID format
2. Validate update data
3. Upload template file mới lên Firebase Storage (nếu có) và xóa file cũ
4. Upload preview file mới lên Firebase Storage (nếu có) và xóa file cũ
5. Cập nhật template trong database
6. Return updated template data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Updated Template Name",
      "htmlUrl": "https://...",
      "previewUrl": "https://...",
      "isActive": true
    },
    "message": "Template updated successfully"
  }
  ```
- **Error Responses**:
  - 400: Validation error / Invalid template ID / Invalid file type
  - 404: Template not found
  - 409: Template name already exists
  - 500: Server error

---

## 6. Activate Template (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/cv-templates/:id/activate`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate template ID format
2. Tìm template theo ID
3. Set isActive = true
4. Return updated template data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Modern Template",
      "isActive": true
    },
    "message": "Template activated successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid template ID format
  - 404: Template not found
  - 500: Server error

---

## 7. Deactivate Template (Admin Only)

- **Method**: `PUT`
- **URL**: `/api/cv-templates/:id/deactivate`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate template ID format
2. Tìm template theo ID
3. Set isActive = false
4. Return updated template data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Modern Template",
      "isActive": false
    },
    "message": "Template deactivated successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid template ID format
  - 404: Template not found
  - 500: Server error

---

## 8. Delete Template (Admin Only)

- **Method**: `DELETE`
- **URL**: `/api/cv-templates/:id`
- **Authentication**: Required
- **Authorization**: ADMIN only

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate template ID format
2. Kiểm tra template có CV nào đang sử dụng không
3. Xóa template khỏi database
4. Xóa files trên Firebase Storage (htmlUrl, previewUrl)
5. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Template deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid template ID format / Cannot delete template that is being used by CVs
  - 404: Template not found
  - 500: Server error

