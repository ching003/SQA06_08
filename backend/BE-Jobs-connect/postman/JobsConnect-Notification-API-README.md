# Postman Collection - JobsConnect Notification API

## Tổng quan

Collection này chứa tất cả các API endpoints cho Notification management của JobsConnect Backend. **Tất cả endpoints đều yêu cầu authentication.**

## Cài đặt

### 1. Import Collection

1. Mở Postman
2. Click **Import** button
3. Chọn file `JobsConnect-Notification-API.postman_collection.json`
4. Collection sẽ được import vào Postman

### 2. Import Environment

Import environment file:
- **Development**: `JobsConnect-Development.postman_environment.json`
  - Base URL: `http://localhost:4000`
  - Dùng cho testing local

**Cách import:**
1. Click **Import** trong Postman
2. Chọn environment file
3. Select environment ở góc trên bên phải

### 3. Cấu hình Environment Variables

Sau khi import environment, đảm bảo các biến sau đã được set:

#### Required Variables:
- `base_url`: Base URL của API (ví dụ: `http://localhost:4000`)
- `auth_token`: JWT token từ login (sẽ được set tự động khi login)

#### Auto-set Variables:
- `notification_id`: ID của notification (sẽ được set tự động khi get notifications)

## Cách sử dụng

### Bước 1: Đăng nhập

**Quan trọng**: Bạn cần login trước để có token. Sử dụng collection **JobsConnect - User API**:

1. Mở collection **JobsConnect - User API**
2. Chạy request **"Login"** trong folder **"Authentication"**
3. Token sẽ tự động được lưu vào biến `auth_token`
4. Quay lại collection **JobsConnect - Notification API**

### Bước 2: Test Notification APIs

Sau khi có token, bạn có thể test các endpoints:

1. **Get My Notifications** - Lấy danh sách notifications (sẽ auto-save `notification_id`)
2. **Get Notification By ID** - Lấy chi tiết notification
3. **Get Unread Count** - Đếm số notifications chưa đọc
4. **Mark Notification As Read** - Đánh dấu đã đọc
5. **Mark All As Read** - Đánh dấu tất cả đã đọc
6. **Delete Notification** - Xóa notification
7. **Delete All Read** - Xóa tất cả notifications đã đọc

## Cấu trúc Collection

### 1. Get Notifications
- **Get My Notifications**: Lấy danh sách notifications với pagination và filters
  - Query params: `page`, `limit`, `type`, `isRead`
  - Auto-save `notification_id` từ notification đầu tiên
  
- **Get Notification By ID**: Lấy thông tin chi tiết notification
  - Path param: `notification_id`
  
- **Get Unread Count**: Đếm số notifications chưa đọc
  - Response: `{ unreadCount: number }`

### 2. Update Notifications
- **Mark Notification As Read**: Đánh dấu một notification là đã đọc
  - Path param: `notification_id`
  
- **Mark All Notifications As Read**: Đánh dấu tất cả notifications là đã đọc

### 3. Delete Notifications
- **Delete Notification**: Xóa một notification
  - Path param: `notification_id`
  
- **Delete All Read Notifications**: Xóa tất cả notifications đã đọc
  - Response: `{ deletedCount: number }`

## Environment Variables

### Biến tự động được set:

| Variable | Mô tả | Được set bởi |
|----------|-------|--------------|
| `auth_token` | JWT token | Login request (từ User API collection) |
| `notification_id` | ID của notification | Get My Notifications request |

### Biến cần set thủ công:

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `base_url` | Base URL của API | `http://localhost:4000` |

## Scripts

### Test Script (Get My Notifications)
- Check status code 200
- Check response có `success`, `data`, `pagination`
- Auto-save `notification_id` từ notification đầu tiên
- Log total notifications và unread count

### Test Script (Get Notification By ID)
- Check status code 200
- Check response có đầy đủ fields: `id`, `type`, `title`, `message`, `isRead`
- Log notification details

### Test Script (Get Unread Count)
- Check status code 200
- Check response có `unreadCount` field
- Log unread count

### Test Script (Mark As Read)
- Check status code 200
- Check `isRead` = `true`
- Log success message

### Test Script (Mark All As Read)
- Check status code 200
- Check response có `success` và `message`

### Test Script (Delete Notification)
- Check status code 200
- Check response có `success` và `message`

### Test Script (Delete All Read)
- Check status code 200
- Check response có `deletedCount`
- Log deleted count

## Testing Flow

### Flow 1: Get và View Notifications
1. **Login** (từ User API collection) → Lưu token
2. **Get My Notifications** → Lấy danh sách, auto-save `notification_id`
3. **Get Unread Count** → Check số notifications chưa đọc
4. **Get Notification By ID** → Xem chi tiết notification

### Flow 2: Mark Notifications As Read
1. **Get My Notifications** → Lấy danh sách
2. **Get Unread Count** → Check số unread
3. **Mark Notification As Read** → Đánh dấu 1 notification đã đọc
4. **Get Unread Count** → Verify số unread giảm
5. **Mark All Notifications As Read** → Đánh dấu tất cả đã đọc
6. **Get Unread Count** → Verify unread = 0

### Flow 3: Delete Notifications
1. **Get My Notifications** → Lấy danh sách
2. **Mark All As Read** → Đánh dấu tất cả đã đọc
3. **Delete All Read Notifications** → Xóa tất cả đã đọc
4. **Get My Notifications** → Verify notifications đã bị xóa
5. **Delete Notification** → Xóa 1 notification cụ thể

## Query Parameters

### Get My Notifications

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `type` | string | No | - | Filter by notification type |
| `isRead` | boolean | No | - | Filter by read status (`true`/`false`) |

### Notification Types

Các loại notification có thể filter:
- `APPLICATION_RECEIVED` - Có đơn ứng tuyển mới
- `APPLICATION_STATUS_CHANGED` - Trạng thái đơn ứng tuyển thay đổi
- `COMPANY_REGISTRATION` - Đăng ký công ty mới
- `COMPANY_APPROVED` - Công ty được duyệt
- `COMPANY_REJECTED` - Công ty bị từ chối
- `COMPANY_UPDATE_PENDING` - Cập nhật công ty đang chờ duyệt
- `COMPANY_INVITATION` - Lời mời tham gia công ty
- `MEMBER_JOINED` - Thành viên mới tham gia
- `MEMBER_REMOVED` - Thành viên bị xóa
- `JOB_POSTED` - Job mới được đăng
- `JOB_APPROVED` - Job được duyệt
- `JOB_REJECTED` - Job bị từ chối
- `JOB_UPDATE_PENDING` - Cập nhật job đang chờ duyệt
- `WELCOME` - Thông báo chào mừng

## Response Examples

### Get My Notifications Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "APPLICATION_RECEIVED",
      "title": "Có đơn ứng tuyển mới",
      "message": "Ứng viên John Doe đã ứng tuyển cho Senior Developer",
      "isRead": false,
      "expiresAt": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe"
      },
      "invitation": null
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

### Get Unread Count Response
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

## Troubleshooting

### 401 Unauthorized
- **Nguyên nhân**: Chưa login hoặc token hết hạn
- **Giải pháp**: 
  1. Mở collection **JobsConnect - User API**
  2. Chạy request **Login**
  3. Quay lại collection này

### 403 Forbidden
- **Nguyên nhân**: Notification không thuộc về user hiện tại
- **Giải pháp**: Chỉ có thể xem/sửa/xóa notifications của chính mình

### 404 Not Found
- **Nguyên nhân**: Notification ID không tồn tại
- **Giải pháp**: 
  1. Chạy **Get My Notifications** để lấy danh sách
  2. Sử dụng `notification_id` từ response

### notification_id không được set
- **Nguyên nhân**: Response không có notifications hoặc format sai
- **Giải pháp**: 
  1. Check response của **Get My Notifications**
  2. Đảm bảo có ít nhất 1 notification trong `data` array
  3. Xem Console trong Postman để check logs

## Tips

1. **Sử dụng Collection Runner**: Chạy toàn bộ collection để test flow
2. **Save Responses**: Lưu example responses để document
3. **Use Variables**: Luôn dùng biến thay vì hardcode values
4. **Check Console**: Xem logs trong Postman Console để debug
5. **Filter Notifications**: Sử dụng query params để filter theo type hoặc isRead

## Notes

- Tất cả endpoints đều yêu cầu authentication
- User chỉ có thể xem/sửa/xóa notifications của chính mình
- Notifications được sắp xếp mặc định theo thời gian tạo (mới nhất trước)
- Pagination mặc định: page=1, limit=20
- Limit tối đa: 100 notifications mỗi trang

