#!/bin/bash

# Enable UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Move to folder where script is located
cd "$(dirname "$0")"

# Create logs & pid folders
mkdir -p logs
mkdir -p pids

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🌾 PIONE AGROTWIN - SMART FARMING PLATFORM 🌾       ║"
echo "║                                                            ║"
echo "║     AI + Blockchain + IoT for Vietnamese Farmers           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo ""

echo "🔍 ĐANG KIỂM TRA CÁC SERVICES CÓ ĐANG CHẠY KHÔNG..."
echo ""

# ============================================================
#     KIỂM TRA TIẾN TRÌNH ĐANG CHẠY — AUTO STOP SH
# ============================================================

IS_RUNNING=0

check_running() {
    if [ -f "$1" ]; then
        local pid=$(cat "$1")
        if ps -p $pid > /dev/null 2>&1; then
            IS_RUNNING=1
        fi
    fi
}

# Check each service pid
check_running "pids/blockchain_bridge.pid"
check_running "pids/data_ingest.pid"
check_running "pids/ai_service.pid"
check_running "pids/backend.pid"
check_running "pids/frontend.pid"

if [ $IS_RUNNING -eq 1 ]; then
    echo "⚠️  PHÁT HIỆN SERVICES ĐANG CHẠY!"
    echo "➡️  TỰ ĐỘNG CHẠY STOP.sh TRƯỚC KHI START..."
    echo ""

    if [ -f "./STOP.sh" ]; then
        chmod +x STOP.sh
        ./STOP.sh
    else
        echo "❌ Không tìm thấy STOP.sh — KHÔNG THỂ TIẾP TỤC!"
        exit 1
    fi

    echo ""
    echo "✅ TẤT CẢ SERVICES ĐÃ ĐƯỢC STOP — TIẾP TỤC START..."
    echo ""
else
    echo "✅ Không có service nào đang chạy → bắt đầu start."
fi

echo ""
echo "🚀 ĐANG KHỞI ĐỘNG 5 SERVICES THEO ĐÚNG THỨ TỰ..."
echo ""


# ============================================================
# 1. Blockchain Bridge  
# ============================================================
echo "⛓️  [1/5] Starting Blockchain Bridge (server.js)..."
nohup node server.js > logs/blockchain_bridge.log 2>&1 &
BLOCKCHAIN_PID=$!
echo $BLOCKCHAIN_PID > pids/blockchain_bridge.pid
echo "✅ Blockchain Bridge started (PID: $BLOCKCHAIN_PID)"
sleep 5


# ============================================================
# 2. Data Ingest Service
# ============================================================
echo "📥 [2/5] Starting Data Ingest Service (app_ingest.py)..."
nohup python3 -u app_ingest.py > logs/data_ingest.log 2>&1 &
DATA_INGEST_PID=$!
echo $DATA_INGEST_PID > pids/data_ingest.pid
echo "✅ Data Ingest started (PID: $DATA_INGEST_PID)"
sleep 4


# ============================================================
# 3. AI Service
# ============================================================
echo "🤖 [3/5] Starting AI Service (ai_service/main.py - Port 8000)..."
nohup bash -c "cd ai_service && source config.env && python3 -u main.py" > logs/ai_service.log 2>&1 &
AI_SERVICE_PID=$!
echo $AI_SERVICE_PID > pids/ai_service.pid
echo "✅ AI Service started (PID: $AI_SERVICE_PID)"
sleep 4


# ============================================================
# 4. Backend API
# ============================================================
echo "🔧 [4/5] Starting Backend API (Dapp/backend/server.js)..."
nohup bash -c "cd Dapp/backend && node server.js" > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > pids/backend.pid
echo "✅ Backend API started (PID: $BACKEND_PID)"
sleep 3


# ============================================================
# 5. Frontend (Next.js)
# ============================================================
echo "🌐 [5/5] Starting Frontend (Dapp/frontend - Port 3000)..."
nohup bash -c "cd Dapp/frontend && npm run dev -- -H 0.0.0.0" > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > pids/frontend.pid
echo "✅ Frontend started (PID: $FRONTEND_PID)"
sleep 5


# ============================================================
# DONE
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ ĐÃ KHỞI ĐỘNG TẤT CẢ 5 SERVICES THÀNH CÔNG!           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "============================================================"
echo "📍 TRUY CẬP HỆ THỐNG:"
echo "============================================================"
echo "  🌐 Frontend:          http://163.61.183.90:3001"
echo "                        http://localhost:3001"
echo "  🤖 AI API:            http://163.61.183.90:8000"
echo "                        http://localhost:8000"
echo "  📥 Data Ingest:       logs/data_ingest.log"
echo "  ⛓️  Blockchain Bridge: logs/blockchain_bridge.log"
echo "  🔧 Backend API:       http://localhost:3000"
echo "============================================================"
echo ""
echo "✅ PID của từng service:"
echo "  ⛓️  Blockchain:  $BLOCKCHAIN_PID"
echo "  📥 Data Ingest:  $DATA_INGEST_PID"
echo "  🤖 AI Service:   $AI_SERVICE_PID"
echo "  🔧 Backend:      $BACKEND_PID"
echo "  🌐 Frontend:     $FRONTEND_PID"
echo ""
echo "✅ Đã khởi động xong! System chạy nền bằng nohup."
