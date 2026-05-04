# Prisma Database Setup

## Cấu hình Database

Database đã được cấu hình để sử dụng PostgreSQL với:
- Database name: `jobsconnect`
- Username: `postgres`
- Password: `1234`
- Host: `localhost`
- Port: `5432`

## Các bước setup

### 1. Tạo database (nếu chưa có)

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE jobsconnect;

# Thoát
\q
```

### 2. Cập nhật file .env

Đảm bảo file `.env` có:
```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/jobsconnect?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Chạy Migration

```bash
npm run prisma:migrate
```

Lần đầu tiên sẽ tạo migration với tên, ví dụ: `init`

### 5. (Optional) Mở Prisma Studio để xem database

```bash
npm run prisma:studio
```

## Schema Overview

Schema bao gồm các models chính:

- **User**: Người dùng hệ thống
- **Company**: Công ty
- **CompanyMember**: Thành viên công ty
- **CV**: Hồ sơ xin việc
- **Job**: Tin tuyển dụng
- **Application**: Đơn ứng tuyển
- **Salary**: Mức lương
- **Notification**: Thông báo
- Và nhiều models khác...

Xem chi tiết trong file `schema.prisma`

