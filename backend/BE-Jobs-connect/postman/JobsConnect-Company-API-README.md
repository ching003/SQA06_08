# Postman Collection - JobsConnect Company API

## Tổng quan

Collection này chứa tất cả các API endpoints cho Company và Company Member management của JobsConnect Backend.

## Cài đặt

### 1. Import Collection

1. Mở Postman
2. Click **Import** button
3. Chọn file `JobsConnect-Company-API.postman_collection.json`
4. Collection sẽ được import vào Postman

### 2. Import Environment

Đảm bảo đã import environment file:
- **Development**: `JobsConnect-Development.postman_environment.json`

Environment này đã được cập nhật với các biến mới cho Company API.

### 3. Cấu hình Environment Variables

Các biến sau sẽ được tự động set khi chạy các requests:

#### Biến tự động được set:
- `company_id` - ID của company (set sau Register Company hoặc Get Company)
- `company_name` - Tên company
- `member_id` - ID của company member
- `invitation_id` - ID của invitation
- `invited_user_email` - Email của user được mời
- `invited_user_id` - ID của user được mời

#### Biến cần set thủ công:
- `invited_user_email` - Email của user để mời vào company (default: "invited@example.com")

## Cách sử dụng

### Bước 1: Đăng nhập

1. Sử dụng collection **JobsConnect - User API** để đăng nhập
2. Hoặc chạy request **"Login"** từ User API collection
3. Token sẽ được lưu vào `auth_token`

### Bước 2: Đăng ký Company

1. Chạy request **"Register Company"** trong folder **"Company Operations"**
2. **Quan trọng**: Request này sử dụng `multipart/form-data` để upload files:
   - **document** (required): Giấy chứng nhận công ty (image hoặc PDF, max 10MB)
   - **logo** (optional): Logo công ty (image, max 5MB)
   - Các fields khác: name, website, description, industry, companySize, foundedYear, address, phone, email
3. Chọn file trong form-data:
   - Click vào field "document" → chọn "File" → chọn file giấy tờ
   - Click vào field "logo" → chọn "File" → chọn file logo (nếu có)
4. Company ID và name sẽ tự động được lưu vào environment
5. Company sẽ có status `PENDING`, cần admin duyệt

### Bước 3: Admin Duyệt Company (nếu cần)

1. Đăng nhập với admin account (dùng User API collection)
2. Chạy request **"Approve Company"** trong folder **"Admin - Company Approval"**
3. Company status sẽ chuyển thành `ACTIVE`

### Bước 4: Quản lý Members

1. **List Members** - Xem danh sách members
2. **Invite Member** - Mời user vào company (cần email của user)
3. **Accept Invitation** - User được mời chấp nhận invitation
4. **Update Member Role** - Thay đổi role của member
5. **Delete Member** - Xóa member khỏi company
6. **Cancel Invitation** - Hủy invitation

## Cấu trúc Collection

### 1. Company Operations
- **Register Company**: Đăng ký company mới với upload logo và giấy tờ (user đăng ký trở thành OWNER). Một số field nhạy cảm (như `members`, `documentUrl`) chỉ hiển thị đầy đủ cho ADMIN hoặc member của company.
  - Sử dụng `multipart/form-data`
  - Document (giấy tờ) là bắt buộc
  - Logo là tùy chọn
- **Get Company By ID**: Lấy thông tin company. ADMIN hoặc member của company sẽ thấy thêm `members` và `documentUrl`. User không phải member chỉ thấy thông tin cơ bản (không có `members` và `documentUrl`).
- **Update Company**: Cập nhật thông tin company (OWNER/MANAGER only)
- **Delete Company**: Xóa company (ADMIN/OWNER only)
- **Get All Companies**: Lấy danh sách companies với pagination (public). Response list **không** bao gồm `members` và `documentUrl` để đảm bảo an toàn dữ liệu.

### 2. Admin - Company Approval
- **Approve Company**: Duyệt company registration (Admin only)
- **Reject Company**: Từ chối company registration (Admin only)

### 3. Company Members
- **List Members**: Lấy danh sách members của company
- **Invite Member**: Mời user vào company (OWNER/MANAGER only)
- **Accept Invitation**: Chấp nhận invitation
- **Cancel Invitation**: Hủy invitation
- **Update Member Role**: Cập nhật role của member
- **Delete Member**: Xóa member khỏi company

## Company Roles

- **OWNER**: Chủ sở hữu company, có toàn quyền
- **MANAGER**: Quản lý, có thể mời member, update role (trừ OWNER), xóa member (trừ OWNER và MANAGER khác)
- **RECRUITER**: Tuyển dụng, có thể quản lý jobs và applications
- **VIEWER**: Chỉ xem, không có quyền chỉnh sửa

## Testing Flow

### Flow 1: Company Registration & Approval
1. **Login** (dùng User API collection) → Lưu token
2. **Register Company** → Lưu company_id
3. **Login as Admin** (dùng User API collection) → Lưu admin token
4. **Approve Company** → Company status = ACTIVE
5. **Get Company By ID** → Verify company info

### Flow 2: Member Management
1. **Login** với owner account → Lưu token
2. **Register Company** → Lưu company_id
3. **Approve Company** (admin) → Company active
4. **Invite Member** → Lưu invitation_id và invited_user_email
5. **Login** với invited user account → Lưu token của invited user
6. **Accept Invitation** → User trở thành member
7. **List Members** → Verify member list
8. **Update Member Role** → Change role
9. **Delete Member** → Remove member

### Flow 3: Company Update
1. **Login** với owner account → Lưu token
2. **Get Company By ID** → Lưu company_id
3. **Update Company** → Update company info
4. **Get Company By ID** → Verify updates

## Environment Variables

### Biến tự động được set:

| Variable | Mô tả | Được set bởi |
|----------|-------|--------------|
| `company_id` | ID của company | Register Company, Get Company |
| `company_name` | Tên company | Register Company, Get Company |
| `member_id` | ID của member | List Members, Accept Invitation |
| `invitation_id` | ID của invitation | Invite Member |
| `invited_user_email` | Email của user được mời | Invite Member |
| `invited_user_id` | ID của user được mời | Invite Member |

### Biến cần set thủ công:

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `invited_user_email` | Email của user để mời | `invited@example.com` |
| `auth_token` | JWT token (từ User API) | (set sau khi login) |

## Scripts

### Pre-request Script (Collection Level)
- Tự động check token expiry
- Tự động refresh token nếu sắp hết hạn

### Test Script (Collection Level)
- Check response time < 5000ms
- Check response format có field `success`

### Test Scripts (Request Level)
- **Register Company**: Lưu company_id và company_name
- **Get Company By ID**: Lưu company_id và company_name
- **Invite Member**: Lưu invitation_id, invited_user_email, invited_user_id
- **Accept Invitation**: Lưu member_id
- **List Members**: Lưu member_id của member đầu tiên

## Authorization Rules

### Company Operations:
- **Register Company**: Any authenticated user (visibility của `members` và `documentUrl` phụ thuộc role)
- **Get Company By ID**: Any authenticated user (visibility của `members` và `documentUrl` phụ thuộc role)
- **Update Company**: OWNER or MANAGER of the company
- **Delete Company**: ADMIN or OWNER
- **Get All Companies**: Any user (public, authentication optional)

### Company Approval:
- **Approve Company**: ADMIN only
- **Reject Company**: ADMIN only

### Member Operations:
- **List Members**: Member of the company
- **Invite Member**: OWNER or MANAGER (company must be ACTIVE)
- **Accept Invitation**: Invited user
- **Cancel Invitation**: OWNER/MANAGER or invited user
- **Update Member Role**: 
  - OWNER can update anyone
  - MANAGER can only update RECRUITER/VIEWER
  - Cannot change OWNER role
- **Delete Member**: 
  - OWNER or MANAGER
  - Cannot delete OWNER
  - MANAGER cannot delete another MANAGER

## Troubleshooting

### Company không được duyệt
- Company mới đăng ký có status `PENDING`
- Cần admin chạy **Approve Company** để set status thành `ACTIVE`
- Chỉ company có status `ACTIVE` mới có thể mời members

### Không thể mời member
- Kiểm tra company status phải là `ACTIVE`
- Kiểm tra user có quyền OWNER hoặc MANAGER
- Kiểm tra user được mời đã tồn tại trong hệ thống
- Kiểm tra user chưa là member của company khác

### Không thể accept invitation
- User phải đăng nhập với account được mời
- Invitation phải chưa hết hạn (7 days)
- User chưa là member của company
- Cần cung cấp `companyId` và `role` trong request body

### 403 Forbidden
- Kiểm tra user có đúng role không (OWNER/MANAGER cho company operations)
- Kiểm tra company status (phải ACTIVE để mời members)
- Kiểm tra token có đúng không

### 404 Not Found
- Kiểm tra `company_id` có đúng không
- Kiểm tra `member_id` có đúng không
- Kiểm tra `invitation_id` có đúng không

## Tips

1. **Test Flow**: Chạy theo thứ tự flow để test đầy đủ
2. **Multiple Users**: Tạo nhiều user accounts để test member management
3. **Save Responses**: Lưu example responses để document
4. **Use Variables**: Luôn dùng biến thay vì hardcode values
5. **Check Console**: Xem logs trong Postman Console để debug

## Notes

- User chỉ có thể là member của 1 company (one-to-one relationship)
- Company mới đăng ký có status `PENDING`, cần admin duyệt
- **Register Company yêu cầu upload files**:
  - Document (giấy tờ) là bắt buộc - image hoặc PDF, max 10MB
  - Logo là tùy chọn - image file, max 5MB
  - Files được upload lên Firebase Storage
- Invitation có thời hạn 7 ngày
- OWNER không thể bị xóa hoặc thay đổi role (trừ khi chính OWNER tự thay đổi)
- MANAGER không thể xóa MANAGER khác hoặc assign OWNER/MANAGER role

## File Upload

### Register Company với Files

Request **Register Company** sử dụng `multipart/form-data`:

**Form Data Fields:**
- `name` (text, required): Tên công ty
- `website` (text, optional): Website
- `description` (text, optional): Mô tả
- `industry` (text, optional): Ngành nghề
- `companySize` (text, optional): STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
- `foundedYear` (text, optional): Năm thành lập (số)
- `address` (text, optional): Địa chỉ
- `phone` (text, optional): Số điện thoại
- `email` (text, optional): Email công ty
- `logo` (file, optional): Logo công ty - image (JPEG, PNG, WebP), max 5MB
- `document` (file, **required**): Giấy chứng nhận - image hoặc PDF, max 10MB

**Cách upload trong Postman:**
1. Chọn body type: `form-data`
2. Thêm các text fields
3. Chọn field "logo" → Type: File → Chọn file
4. Chọn field "document" → Type: File → Chọn file (bắt buộc)
5. Send request

