#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🛑 STOPPING UNIFIED SERVICES                        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

STOPPED_COUNT=0

stop_service() {
    local SERVICE_NAME=$1
    local PID_FILE=$2
    
    if [ -f "$PID_FILE" ]; then
        local PID=$(cat "$PID_FILE")
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "🛑 Stopping $SERVICE_NAME (PID: $PID)..."
            kill $PID
            
            # Wait max 5 seconds
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    echo "   ✅ $SERVICE_NAME stopped"
                    STOPPED_COUNT=$((STOPPED_COUNT + 1))
                    break
                fi
                sleep 0.5
            done
            
            # Force kill if still running
            if ps -p $PID > /dev/null 2>&1; then
                echo "   ⚠️  Force killing $SERVICE_NAME..."
                kill -9 $PID 2>/dev/null
                STOPPED_COUNT=$((STOPPED_COUNT + 1))
            fi
        else
            echo "ℹ️  $SERVICE_NAME not running (PID: $PID)"
        fi
        
        rm -f "$PID_FILE"
    else
        echo "ℹ️  $SERVICE_NAME not found (no PID file)"
    fi
}

# Stop unified services
stop_service "Unified Gateway" "pids/unified_gateway.pid"
stop_service "AI Auto Analyzer" "pids/ai_auto_analyzer.pid"
stop_service "Unified Backend" "pids/unified_backend.pid"

# Stop old services (nếu còn chạy)
stop_service "Blockchain Bridge" "pids/blockchain_bridge.pid"
stop_service "Data Ingest" "pids/data_ingest.pid"
stop_service "AI Service" "pids/ai_service.pid"
stop_service "Backend API" "pids/backend.pid"
stop_service "Frontend" "pids/frontend.pid"

echo ""
echo "============================================================"
if [ $STOPPED_COUNT -gt 0 ]; then
    echo "✅ Đã dừng $STOPPED_COUNT service(s)"
else
    echo "ℹ️  Không có service nào đang chạy"
fi
echo "============================================================"
echo ""

