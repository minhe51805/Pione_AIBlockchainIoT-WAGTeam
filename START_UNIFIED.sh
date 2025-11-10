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

echo "🔍 ĐANG KIỂM TRA VÀ RESET TẤT CẢ SERVICES CŨ..."
echo ""

# ============================================================
#     TỰ ĐỘNG RESET - KILL TẤT CẢ PROCESS CŨ
# ============================================================

# Function to check and kill processes by name
kill_process() {
    local process_name="$1"
    local display_name="$2"
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "   🛑 Stopping $display_name..."
        pkill -9 -f "$process_name" 2>/dev/null
        sleep 1
        return 0
    fi
    return 1
}

# Kill all related processes
KILLED=0

if kill_process "python3.*unified_backend" "Unified Backend"; then
    KILLED=1
fi

if kill_process "node.*gateway" "Gateway"; then
    KILLED=1
fi

if kill_process "python3.*ai_auto_analyzer" "AI Auto Analyzer"; then
    KILLED=1
fi

# Kill legacy processes if any
kill_process "python3.*blockchain_bridge" "Blockchain Bridge (legacy)" 2>/dev/null
kill_process "python3.*app_ingest" "Data Ingest (legacy)" 2>/dev/null
kill_process "python3.*ai_service" "AI Service (legacy)" 2>/dev/null
kill_process "node.*server" "Backend API (legacy)" 2>/dev/null
kill_process "npm.*dev" "Frontend Dev (legacy)" 2>/dev/null

if [ $KILLED -eq 1 ]; then
    echo ""
    echo "✅ ĐÃ RESET TẤT CẢ SERVICES CŨ"
    echo "⏳ Chờ 3 giây để giải phóng ports..."
    sleep 3
else
    echo "✅ Không có service nào đang chạy"
fi

# Clean old PID files
rm -f pids/*.pid 2>/dev/null

# Verify ports are free
echo ""
echo "🔍 Kiểm tra ports..."
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  Port 8080 vẫn bị chiếm - force kill..."
    fuser -k 8080/tcp 2>/dev/null
    sleep 1
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 vẫn bị chiếm - force kill..."
    fuser -k 3000/tcp 2>/dev/null
    sleep 1
fi

echo "✅ Ports đã sẵn sàng!"

echo ""
echo "🚀 ĐANG KHỞI ĐỘNG 3 SERVICES..."
echo ""


# ============================================================
# 1. UNIFIED BACKEND (Flask + FastAPI) - Port 8080
# ============================================================
echo "🤖 [1/3] Starting Unified Backend (Port 8080 - Internal)..."
echo "   • Flask Data Ingest API"
echo "   • Flask Auth & Dashboard API"
echo "   • FastAPI AI Service"
echo ""

nohup python3 -u unified_backend.py > logs/unified_backend.log 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID
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
disown $AI_ANALYZER_PID
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
disown $GATEWAY_PID
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

