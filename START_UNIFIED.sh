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
echo "║        🌾 PIONE AGROTWIN - UNIFIED STARTUP 🌾              ║"
echo "║                                                            ║"
echo "║     Chỉ chạy 2 services - Port 3000 ra ngoài              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo ""

echo "🔍 ĐANG KIỂM TRA CÁC SERVICES CÓ ĐANG CHẠY KHÔNG..."
echo ""

# ============================================================
#     KIỂM TRA TIẾN TRÌNH ĐANG CHẠY — AUTO STOP
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

# Check unified service pids
check_running "pids/unified_gateway.pid"
check_running "pids/unified_backend.pid"

# Check old service pids (nếu còn chạy)
check_running "pids/blockchain_bridge.pid"
check_running "pids/data_ingest.pid"
check_running "pids/ai_service.pid"
check_running "pids/backend.pid"
check_running "pids/frontend.pid"

if [ $IS_RUNNING -eq 1 ]; then
    echo "⚠️  PHÁT HIỆN SERVICES ĐANG CHẠY!"
    echo "➡️  TỰ ĐỘNG STOP TẤT CẢ SERVICES TRƯỚC KHI START..."
    echo ""

    if [ -f "./STOP_UNIFIED.sh" ]; then
        chmod +x STOP_UNIFIED.sh
        ./STOP_UNIFIED.sh
    else
        echo "⚠️  Không tìm thấy STOP_UNIFIED.sh - dùng STOP_NEW.sh..."
        if [ -f "./STOP_NEW.sh" ]; then
            chmod +x STOP_NEW.sh
            ./STOP_NEW.sh
        fi
    fi

    echo ""
    echo "✅ TẤT CẢ SERVICES ĐÃ ĐƯỢC STOP — TIẾP TỤC START..."
    echo ""
    sleep 2
else
    echo "✅ Không có service nào đang chạy → bắt đầu start."
fi

echo ""
echo "🚀 ĐANG KHỞI ĐỘNG 3 SERVICES..."
echo ""


# ============================================================
# 1. UNIFIED BACKEND (Flask + FastAPI) - Port 8080
# ============================================================
echo "🤖 [1/2] Starting Unified Backend (Port 8080 - Internal)..."
echo "   • Flask Data Ingest API"
echo "   • Flask Auth & Dashboard API"
echo "   • FastAPI AI Service"
echo ""

nohup python3 -u unified_backend.py > logs/unified_backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > pids/unified_backend.pid
echo "✅ Unified Backend started (PID: $BACKEND_PID)"
echo "   Waiting for backend to be ready..."
sleep 8

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "   ✅ Backend running successfully!"
else
    echo "   ❌ Backend failed to start! Check logs/unified_backend.log"
    exit 1
fi

echo ""


# ============================================================
# 2. AI AUTO ANALYZER (Python) - Background Job
# ============================================================
echo "🤖 [2/3] Starting AI Auto Analyzer (Every 5 minutes)..."
echo "   • Automatic daily data aggregation"
echo "   • AI analysis trigger"
echo ""

nohup python3 -u ai_auto_analyzer.py > logs/ai_auto_analyzer.log 2>&1 &
AI_ANALYZER_PID=$!
echo $AI_ANALYZER_PID > pids/ai_auto_analyzer.pid
echo "✅ AI Auto Analyzer started (PID: $AI_ANALYZER_PID)"
sleep 2

# Check if analyzer is running
if ps -p $AI_ANALYZER_PID > /dev/null 2>&1; then
    echo "   ✅ AI Analyzer running successfully!"
else
    echo "   ⚠️  AI Analyzer failed to start (non-critical)"
fi

echo ""


# ============================================================
# 3. UNIFIED GATEWAY (Node.js) - Port 3000
# ============================================================
echo "⛓️  [3/3] Starting Unified Gateway (Port 3000 - External)..."
echo "   • Blockchain Bridge"
echo "   • API Proxy to Backend"
echo "   • Frontend Static Files"
echo ""

# Check if frontend is built
FRONTEND_BUILD="Dapp/frontend/out"
if [ ! -d "$FRONTEND_BUILD" ]; then
    echo "   ⚠️  Frontend chưa được build!"
    echo "   ⏳ Đang build frontend... (có thể mất 1-2 phút)"
    echo ""
    
    cd Dapp/frontend
    npm run build
    BUILD_STATUS=$?
    cd ../..
    
    if [ $BUILD_STATUS -eq 0 ]; then
        echo "   ✅ Frontend build thành công!"
    else
        echo "   ⚠️  Frontend build thất bại - gateway vẫn sẽ chạy (API only)"
    fi
    echo ""
fi

nohup node gateway.js > logs/unified_gateway.log 2>&1 &
GATEWAY_PID=$!
echo $GATEWAY_PID > pids/unified_gateway.pid
echo "✅ Unified Gateway started (PID: $GATEWAY_PID)"
echo "   Waiting for gateway to be ready..."
sleep 5

# Check if gateway is running
if ps -p $GATEWAY_PID > /dev/null 2>&1; then
    echo "   ✅ Gateway running successfully!"
else
    echo "   ❌ Gateway failed to start! Check logs/unified_gateway.log"
    exit 1
fi

echo ""


# ============================================================
# DONE
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ ĐÃ KHỞI ĐỘNG TẤT CẢ SERVICES THÀNH CÔNG!             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "============================================================"
echo "📍 TRUY CẬP HỆ THỐNG (CHỈ CẦN PORT 3000):"
echo "============================================================"
echo ""
echo "  🌐 URL CHÍNH (External):"
echo "     http://163.61.183.90:3000"
echo "     http://localhost:3000"
echo ""
echo "  📱 Tất cả endpoints qua Port 3000:"
echo "     • Frontend:          http://localhost:3000/"
echo "     • Data Ingest:       http://localhost:3000/api/data"
echo "     • Auth:              http://localhost:3000/api/auth/*"
echo "     • Dashboard:         http://localhost:3000/api/dashboard/*"
echo "     • AI Analyze:        http://localhost:3000/api/ai/analyze"
echo "     • Blockchain:        http://localhost:3000/getData"
echo ""
echo "  🔒 Port nội bộ (Internal - không cần expose):"
echo "     • Backend:           http://localhost:8080 (Flask+FastAPI)"
echo ""
echo "============================================================"
echo ""
echo "✅ PID của services:"
echo "  🤖 Unified Backend:   $BACKEND_PID"
echo "  🔄 AI Auto Analyzer:  $AI_ANALYZER_PID"
echo "  ⛓️  Unified Gateway:   $GATEWAY_PID"
echo ""
echo "📝 Logs:"
echo "  • Backend:       tail -f logs/unified_backend.log"
echo "  • AI Analyzer:   tail -f logs/ai_auto_analyzer.log"
echo "  • Gateway:       tail -f logs/unified_gateway.log"
echo ""
echo "🛑 Để dừng hệ thống: ./STOP_UNIFIED.sh"
echo ""
echo "✅ Hệ thống đã sẵn sàng! Chỉ cần mở Port 3000 ra bên ngoài."
echo ""

