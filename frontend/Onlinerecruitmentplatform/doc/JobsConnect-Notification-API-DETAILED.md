# JobsConnect - Notification API Documentation

## Base URL
```
/api/notifications
```

## Authentication
Tất cả endpoints yêu cầu JWT authentication. Include token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get My Notifications

- **Method**: `GET`
- **URL**: `/api/notifications/my`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 20, max: 100)
  - `type`: enum (optional) - Filter by type: APPLICATION_RECEIVED, APPLICATION_STATUS_CHANGED, COMPANY_REGISTRATION, COMPANY_APPROVED, COMPANY_REJECTED, etc.
  - `isRead`: boolean (optional) - Filter by read status (true/false)

### Xử lý
1. Validate query parameters (page, limit, type, isRead)
2. Lấy userId từ authenticated user
3. Build where clause (userId, type filter, isRead filter)
4. Query notifications với pagination (orderBy createdAt desc)
5. Return list notifications và pagination info

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "APPLICATION_STATUS_CHANGED",
        "title": "Trạng thái đơn ứng tuyển đã thay đổi",
        "message": "Đơn ứng tuyển cho Senior Software Engineer đã được cập nhật thành ACCEPTED",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
  ```
- **Error Responses**:
  - 400: Validation error (invalid query parameters)
  - 500: Server error

---

## 2. Get Notification By ID

- **Method**: `GET`
- **URL**: `/api/notifications/:id`
- **Authentication**: Required
- **Authorization**: User chỉ có thể xem notifications của chính mình

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate notification ID format
2. Lấy userId từ authenticated user
3. Tìm notification theo ID với relations
4. Kiểm tra notification thuộc về user
5. Return notification data

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "type": "APPLICATION_STATUS_CHANGED",
      "title": "Trạng thái đơn ứng tuyển đã thay đổi",
      "message": "Đơn ứng tuyển cho Senior Software Engineer đã được cập nhật thành ACCEPTED",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": null
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid notification ID format
  - 403: Unauthorized: You can only view your own notifications
  - 404: Notification not found
  - 500: Server error

---

## 3. Get Unread Count

- **Method**: `GET`
- **URL**: `/api/notifications/unread-count`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`

### Xử lý
1. Lấy userId từ authenticated user
2. Đếm số notifications chưa đọc (isRead = false) của user
3. Return unread count

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "unreadCount": 5
    }
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 4. Mark Notification As Read

- **Method**: `PATCH`
- **URL**: `/api/notifications/:id/read`
- **Authentication**: Required
- **Authorization**: User chỉ có thể mark notifications của chính mình

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate notification ID format
2. Lấy userId từ authenticated user
3. Kiểm tra notification tồn tại
4. Kiểm tra notification thuộc về user
5. Cập nhật notification isRead = true, readAt = now
6. Return updated notification data với relations

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "isRead": true,
      "readAt": "2024-01-01T12:00:00.000Z"
    },
    "message": "Notification marked as read"
  }
  ```
- **Error Responses**:
  - 400: Invalid notification ID format
  - 403: Unauthorized: You can only mark your own notifications as read
  - 404: Notification not found
  - 500: Server error

---

## 5. Mark All Notifications As Read

- **Method**: `PATCH`
- **URL**: `/api/notifications/mark-all-read`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

### Xử lý
1. Lấy userId từ authenticated user
2. Cập nhật tất cả notifications của user: isRead = true, readAt = now
3. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```
- **Error Responses**:
  - 500: Server error

---

## 6. Delete Notification

- **Method**: `DELETE`
- **URL**: `/api/notifications/:id`
- **Authentication**: Required
- **Authorization**: User chỉ có thể xóa notifications của chính mình

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: string (required, UUID format)

### Xử lý
1. Validate notification ID format
2. Lấy userId từ authenticated user
3. Kiểm tra notification tồn tại
4. Kiểm tra notification thuộc về user
5. Xóa notification khỏi database
6. Return success message

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Invalid notification ID format
  - 403: Unauthorized: You can only delete your own notifications
  - 404: Notification not found
  - 500: Server error

---

## 7. Delete All Read Notifications

- **Method**: `DELETE`
- **URL**: `/api/notifications/read`
- **Authentication**: Required
- **Authorization**: None

### Input
- **Headers**: 
  - `Authorization: Bearer <token>`

### Xử lý
1. Lấy userId từ authenticated user
2. Xóa tất cả notifications đã đọc (isRead = true) của user
3. Return số lượng notifications đã xóa

### Output
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "deletedCount": 10
    },
    "message": "10 read notification(s) deleted successfully"
  }
  ```
- **Error Responses**:
  - 500: Server error

