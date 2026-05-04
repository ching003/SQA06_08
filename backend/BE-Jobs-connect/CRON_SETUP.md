# Cron Job Setup - Daily Cleanup

Hướng dẫn setup cron job để tự động cập nhật trạng thái Jobs và Invitations hết hạn.

## Chức năng

Cron job chạy **mỗi ngày lúc 0h** để:

1. **Expire Jobs** - Cập nhật jobs hết hạn từ `ACTIVE` → `INACTIVE`
2. **Expire Invitations** - Cập nhật lời mời hết hạn từ `PENDING` → `EXPIRED`

## Cấu trúc Files

```
src/cron/
├── use-cases/
│   ├── ExpireJobsUseCase.ts        # Logic expire jobs
│   └── ExpireInvitationsUseCase.ts # Logic expire invitations
└── jobs/
    └── daily-cleanup.ts            # Script chính chạy cron job
```

## Test Script Thủ Công

Trước khi setup cron, test script để chắc chắn hoạt động đúng:

```bash
npm run cron:daily
```

Output mẫu:
```
========================================
Daily Cleanup Job Started at 2024-01-15T00:00:00.000Z
========================================

1. Checking for expired jobs...
   ✓ Expired 3 jobs

2. Checking for expired invitations...
   ✓ Expired 2 invitations

========================================
Daily Cleanup Job Completed
Duration: 234ms
Summary:
  - Expired Jobs: 3
  - Expired Invitations: 2
========================================
```

## Setup Cron trên Linux/Ubuntu

### 1. Tạo script wrapper

Tạo file `/home/your-user/run-daily-cleanup.sh`:

```bash
#!/bin/bash

# Đường dẫn đến project
cd /home/your-user/BE-Jobs-connect

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Chạy cron job
npm run cron:daily >> /var/log/jobs-connect-cron.log 2>&1
```

Cấp quyền thực thi:

```bash
chmod +x /home/your-user/run-daily-cleanup.sh
```

### 2. Cấu hình Crontab

Mở crontab editor:

```bash
crontab -e
```

Thêm dòng sau (chạy lúc 0h mỗi ngày):

```cron
0 0 * * * /home/your-user/run-daily-cleanup.sh
```

**Format crontab:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Ngày trong tuần (0-7, 0 và 7 là Chủ nhật)
│ │ │ └───── Tháng (1-12)
│ │ └─────── Ngày trong tháng (1-31)
│ └───────── Giờ (0-23)
└─────────── Phút (0-59)
```

**Các ví dụ khác:**
```cron
0 0 * * *     # Mỗi ngày lúc 0h
0 */6 * * *   # Mỗi 6 giờ
30 2 * * *    # Mỗi ngày lúc 2:30 sáng
0 0 * * 0     # Mỗi Chủ nhật lúc 0h
```

### 3. Kiểm tra Cron đang chạy

```bash
# Xem danh sách cron jobs
crontab -l

# Xem log cron
tail -f /var/log/jobs-connect-cron.log

# Hoặc xem system cron log
sudo tail -f /var/log/syslog | grep CRON
```

## Setup trên Windows (Task Scheduler)

### 1. Tạo file batch

Tạo file `run-daily-cleanup.bat`:

```batch
@echo off
cd /d C:\path\to\BE-Jobs-connect
call npm run cron:daily >> cron.log 2>&1
```

### 2. Tạo Task trong Task Scheduler

1. Mở **Task Scheduler**
2. Click **Create Basic Task**
3. Name: `Jobs Connect Daily Cleanup`
4. Trigger: **Daily** at **00:00**
5. Action: **Start a program**
   - Program: `C:\path\to\run-daily-cleanup.bat`
6. Finish

## Monitoring & Logging

### Xem logs

Logs được ghi vào `/var/log/jobs-connect-cron.log` (Linux) hoặc `cron.log` (Windows).

```bash
# Xem logs realtime
tail -f /var/log/jobs-connect-cron.log

# Xem 50 dòng cuối
tail -n 50 /var/log/jobs-connect-cron.log

# Tìm kiếm errors
grep "Error" /var/log/jobs-connect-cron.log
```

### Log rotation (Linux)

Tạo file `/etc/logrotate.d/jobs-connect-cron`:

```
/var/log/jobs-connect-cron.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## Troubleshooting

### Cron không chạy

1. **Kiểm tra cron service đang chạy:**
   ```bash
   sudo systemctl status cron
   ```

2. **Kiểm tra quyền thực thi script:**
   ```bash
   ls -la /home/your-user/run-daily-cleanup.sh
   ```

3. **Test script thủ công:**
   ```bash
   /home/your-user/run-daily-cleanup.sh
   ```

4. **Kiểm tra environment variables:**
   - Cron chạy với minimal environment
   - Đảm bảo `.env` được load trong script

### Database connection failed

- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database service đang chạy
- Kiểm tra firewall/network rules

### Script chạy nhưng không update

- Kiểm tra logs để xem có errors không
- Verify database có records cần expire không
- Test thủ công bằng `npm run cron:daily`

## Tùy chỉnh

### Thay đổi thời gian chạy

Edit crontab:
```bash
crontab -e
```

Ví dụ chạy lúc 2:30 sáng:
```cron
30 2 * * * /home/your-user/run-daily-cleanup.sh
```

### Thêm notification khi job fail

Sửa script wrapper:

```bash
#!/bin/bash
cd /home/your-user/BE-Jobs-connect
export $(cat .env | grep -v '^#' | xargs)

npm run cron:daily >> /var/log/jobs-connect-cron.log 2>&1

# Kiểm tra exit code
if [ $? -ne 0 ]; then
    # Gửi email hoặc notification
    echo "Cron job failed at $(date)" | mail -s "Jobs Connect Cron Failed" admin@example.com
fi
```

## Bảo mật

1. **Đảm bảo file .env không được commit:**
   ```bash
   # .gitignore
   .env
   cron.log
   *.log
   ```

2. **Giới hạn quyền truy cập log files:**
   ```bash
   chmod 600 /var/log/jobs-connect-cron.log
   ```

3. **Sử dụng user riêng để chạy cron:**
   ```bash
   # Chạy với user 'jobsconnect'
   sudo -u jobsconnect crontab -e
   ```

## Mở rộng trong tương lai

Các tính năng có thể thêm:

- ✅ Gửi notification cho companies về jobs hết hạn
- ✅ Gửi notification cho users về invitations hết hạn
- ✅ Tự động reject applications của jobs hết hạn
- ✅ Dọn dẹp notifications cũ (> 90 ngày)
- ✅ Inactive users/companies không hoạt động lâu
- ✅ Gửi email reminder trước khi job hết hạn (3 ngày)
- ✅ Metrics/analytics về số lượng jobs/invitations expired

## Tài liệu tham khảo

- [Crontab Guru](https://crontab.guru/) - Tool tạo cron expressions
- [Node Cron](https://www.npmjs.com/package/node-cron) - Alternative: chạy cron trong Node.js app
