# Postman Collection - JobsConnect User API

## Tổng quan

Collection này chứa tất cả các API endpoints cho User management của JobsConnect Backend.

## Cài đặt

### 1. Import Collection

1. Mở Postman
2. Click **Import** button
3. Chọn file `JobsConnect-User-API.postman_collection.json`
4. Collection sẽ được import vào Postman

### 2. Import Environment

Import một trong các environment files:

- **Development**: `JobsConnect-Development.postman_environment.json`
  - Base URL: `http://localhost:4000`
  - Dùng cho testing local

- **Production**: `JobsConnect-Production.postman_environment.json`
  - Base URL: `https://api.jobsconnect.com` (cập nhật theo production URL)
  - Dùng cho testing production

**Cách import:**
1. Click **Import** trong Postman
2. Chọn environment file
3. Select environment ở góc trên bên phải

### 3. Cấu hình Environment Variables

Sau khi import environment, cập nhật các biến sau:

#### Development Environment:
- `test_email`: Email để test (ví dụ: `test@example.com`)
- `test_password`: Password để test (ví dụ: `password123`)

#### Production Environment:
- `base_url`: Production API URL
- `test_email`: Email thật để test
- `test_password`: Password thật để test

## Cách sử dụng

### Bước 1: Đăng ký hoặc Đăng nhập

1. Chạy request **"Login"** trong folder **"Authentication"**
2. Token sẽ tự động được lưu vào biến `auth_token`
3. User info sẽ được lưu vào `user_id`, `user_email`, `user_role`

### Bước 2: Sử dụng các API khác

Sau khi login, tất cả các request khác sẽ tự động sử dụng token từ biến `auth_token`.

### Auto Token Refresh

Collection có script tự động refresh token:
- Trước mỗi request, script sẽ check token expiry
- Nếu token sắp hết hạn (trong 5 phút), sẽ tự động login lại
- Token mới sẽ được lưu tự động

## Cấu trúc Collection

### 1. Authentication (Public APIs)
- **Register User**: Đăng ký user mới
- **Login**: Đăng nhập và lưu token tự động
- **Logout**: Đăng xuất

### 2. User Profile (Authenticated APIs)
- **Get User By ID**: Lấy thông tin user
- **Get User Info**: Lấy thông tin chi tiết
- **Get User Age**: Tính tuổi
- **Update Profile**: Cập nhật profile
- **Change Password**: Đổi mật khẩu
- **Upload Avatar**: Upload avatar (form-data)
- **Update Status**: Cập nhật status

### 3. Admin APIs (Admin Only)
- **Get All Users**: Lấy danh sách users với pagination
- **Create User (Admin)**: Tạo user (admin)
- **Update User (Admin)**: Cập nhật user (admin)
- **Delete User**: Xóa user
- **Lock Account**: Khóa tài khoản
- **Unlock Account**: Mở khóa tài khoản

## Environment Variables

### Biến tự động được set:

| Variable | Mô tả | Được set bởi |
|----------|-------|--------------|
| `auth_token` | JWT token | Login request |
| `user_id` | ID của user | Login/Register |
| `user_email` | Email của user | Login/Register |
| `user_role` | Role của user | Login |

### Biến cần set thủ công:

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `base_url` | Base URL của API | `http://localhost:4000` |
| `test_email` | Email để test | `test@example.com` |
| `test_password` | Password để test | `password123` |
| `admin_token` | Token của admin user | (set sau khi login với admin) |

## Scripts

### Pre-request Script (Collection Level)
- Tự động check token expiry
- Tự động refresh token nếu sắp hết hạn

### Test Script (Collection Level)
- Check response time < 5000ms
- Check response format có field `success`

### Test Script (Login Request)
- Lưu token vào `auth_token`
- Lưu user info vào các biến tương ứng
- Log success message

### Test Script (Register Request)
- Lưu user_id và user_email sau khi register

## Testing Flow

### Flow 1: User Registration & Login
1. **Register User** → Lưu user_id
2. **Login** → Lưu token và user info
3. **Get User By ID** → Test authenticated request
4. **Update Profile** → Test update
5. **Upload Avatar** → Test file upload

### Flow 2: Admin Operations
1. **Login** với admin account → Lưu vào `admin_token`
2. **Get All Users** → Test pagination
3. **Lock Account** → Test admin action
4. **Unlock Account** → Test admin action

## Troubleshooting

### Token không được lưu
- Kiểm tra response của Login request có `success: true` và `data.token`
- Kiểm tra Test script của Login request có chạy không
- Xem Console trong Postman để check logs

### Token hết hạn
- Token sẽ tự động được refresh nếu sắp hết hạn
- Nếu token đã hết hạn hoàn toàn, chạy lại Login request

### 401 Unauthorized
- Kiểm tra `auth_token` có giá trị không
- Kiểm tra token format: `Bearer <token>`
- Chạy lại Login request để lấy token mới

### 403 Forbidden
- API yêu cầu ADMIN role
- Đăng nhập với admin account và lưu token vào `admin_token`
- Sử dụng `admin_token` thay vì `auth_token` cho admin APIs

## Tips

1. **Sử dụng Collection Runner**: Chạy toàn bộ collection để test flow
2. **Save Responses**: Lưu example responses để document
3. **Use Variables**: Luôn dùng biến thay vì hardcode values
4. **Check Console**: Xem logs trong Postman Console để debug

## Notes

- Token expiry được set trong backend (default: 7 days)
- Auto-refresh chỉ hoạt động nếu có `test_email` và `test_password` trong environment
- File upload (avatar) cần chọn file trong form-data
- Admin APIs yêu cầu user có role `ADMIN`

