#!/bin/bash

# Script tự động setup cron job cho Jobs Connect
# Chạy: bash scripts/setup-cron.sh

set -e

echo "=========================================="
echo "Jobs Connect - Cron Job Setup"
echo "=========================================="
echo ""

# Get current directory
PROJECT_DIR=$(pwd)
USER_HOME=$HOME

echo "Project directory: $PROJECT_DIR"
echo "User home: $USER_HOME"
echo ""

# 1. Tạo wrapper script
WRAPPER_SCRIPT="$USER_HOME/run-jobs-connect-cron.sh"

echo "1. Creating wrapper script at: $WRAPPER_SCRIPT"

cat > "$WRAPPER_SCRIPT" << 'EOF'
#!/bin/bash

# Đường dẫn đến project (sẽ được thay thế)
cd PROJECT_DIR_PLACEHOLDER

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Chạy cron job và ghi log
npm run cron:daily >> /var/log/jobs-connect-cron.log 2>&1

# Kiểm tra exit code
if [ $? -ne 0 ]; then
    echo "[ERROR] Cron job failed at $(date)" >> /var/log/jobs-connect-cron.log
fi
EOF

# Thay thế PROJECT_DIR_PLACEHOLDER bằng đường dẫn thực tế
sed -i "s|PROJECT_DIR_PLACEHOLDER|$PROJECT_DIR|g" "$WRAPPER_SCRIPT"

# Cấp quyền thực thi
chmod +x "$WRAPPER_SCRIPT"

echo "   ✓ Wrapper script created"
echo ""

# 2. Tạo log file
echo "2. Creating log file..."

sudo touch /var/log/jobs-connect-cron.log
sudo chmod 666 /var/log/jobs-connect-cron.log

echo "   ✓ Log file created: /var/log/jobs-connect-cron.log"
echo ""

# 3. Setup crontab
echo "3. Setting up crontab..."

# Kiểm tra xem cron job đã tồn tại chưa
CRON_EXISTS=$(crontab -l 2>/dev/null | grep -c "run-jobs-connect-cron.sh" || true)

if [ "$CRON_EXISTS" -gt 0 ]; then
    echo "   ⚠ Cron job already exists in crontab"
    echo ""
    read -p "   Do you want to replace it? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Xóa cron job cũ
        crontab -l | grep -v "run-jobs-connect-cron.sh" | crontab -
        echo "   ✓ Removed old cron job"
    else
        echo "   Skipping crontab setup"
        exit 0
    fi
fi

# Thêm cron job mới (chạy lúc 0h mỗi ngày)
(crontab -l 2>/dev/null; echo "0 0 * * * $WRAPPER_SCRIPT") | crontab -

echo "   ✓ Cron job added to crontab"
echo ""

# 4. Hiển thị crontab hiện tại
echo "4. Current crontab entries:"
echo "-------------------------------------------"
crontab -l | grep "run-jobs-connect-cron.sh" || echo "   (no entries)"
echo "-------------------------------------------"
echo ""

# 5. Test script
echo "5. Testing cron script..."
echo ""

$WRAPPER_SCRIPT

echo ""
echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Check logs: tail -f /var/log/jobs-connect-cron.log"
echo "  2. View crontab: crontab -l"
echo "  3. Edit crontab: crontab -e"
echo ""
echo "Cron schedule: 0 0 * * * (Daily at midnight)"
echo "To change schedule, run: crontab -e"
echo ""
