#!/bin/bash

# Enable UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Move to folder where script is located
cd "$(dirname "$0")"

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🛑 PIONE AGROTWIN - DỪNG TẤT CẢ SERVICES                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo ""

# ==============================
#  FUNCTION STOP BY PID FILE
# ==============================
stop_by_pid_file() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")

        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Đang dừng $service_name (PID: $pid)..."
            kill $pid 2>/dev/null
            sleep 1
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
            echo "✅ Đã dừng $service_name"
        else
            echo "⚠️  $service_name không chạy (PID file cũ)"
        fi

        rm -f "$pid_file"
    else
        echo "⚠️  Không tìm thấy PID file cho $service_name"
    fi
}

echo "🛑 Đang dừng các services theo PID files..."
echo ""

# ==============================
#   STOP ALL SERVICES
# ==============================
stop_by_pid_file "pids/frontend.pid"           "Frontend"
stop_by_pid_file "pids/backend.pid"            "Backend API"
stop_by_pid_file "pids/ai_service.pid"         "AI Service"
stop_by_pid_file "pids/data_ingest.pid"        "Data Ingest"
stop_by_pid_file "pids/blockchain_bridge.pid"  "Blockchain Bridge"

echo ""
echo "🧹 Dọn dẹp các process còn sót lại..."
echo ""

# ==============================
#   BACKUP KILL - NODEJS
# ==============================
echo "🛑 Dừng Node.js processes còn sót..."

pkill -f "node server.js" 2>/dev/null \
    && echo "✅ Đã dừng node server.js" \
    || echo "⚠️  Không có node server.js đang chạy"

pkill -f "cd Dapp/backend && node server.js" 2>/dev/null \
    && echo "✅ Đã dừng Backend API" \
    || echo "⚠️  Backend API không còn chạy"

pkill -f "npm run dev" 2>/dev/null \
    && echo "✅ Đã dừng Frontend dev" \
    || echo "⚠️  Frontend dev không còn chạy"

echo ""

# ==============================
#   BACKUP KILL - PYTHON
# ==============================
echo "🛑 Dừng Python processes còn sót..."

pkill -f "app_ingest.py" 2>/dev/null \
    && echo "✅ Đã dừng app_ingest.py" \
    || echo "⚠️  Không có app_ingest.py process"

pkill -f "ai_service/main.py" 2>/dev/null \
    && echo "✅ Đã dừng ai_service" \
    || echo "⚠️  ai_service không còn chạy"

echo ""

# Cleanup PID folder
rm -f pids/*.pid 2>/dev/null

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ ĐÃ DỪNG TẤT CẢ SERVICES!                             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Để khởi động lại: ./START.sh"
echo ""
