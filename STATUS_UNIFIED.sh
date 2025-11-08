#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        📊 UNIFIED SERVICES STATUS                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

RUNNING_COUNT=0
TOTAL_COUNT=2

check_service() {
    local SERVICE_NAME=$1
    local PID_FILE=$2
    local PORT=$3
    
    if [ -f "$PID_FILE" ]; then
        local PID=$(cat "$PID_FILE")
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ $SERVICE_NAME"
            echo "   PID: $PID"
            echo "   Port: $PORT"
            
            # Show memory usage
            local MEM=$(ps -p $PID -o rss= | awk '{print int($1/1024)"MB"}')
            echo "   Memory: $MEM"
            
            # Check if port is listening
            if command -v netstat &> /dev/null; then
                if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
                    echo "   Status: 🟢 LISTENING"
                else
                    echo "   Status: 🟡 RUNNING (port not detected)"
                fi
            else
                echo "   Status: 🟢 RUNNING"
            fi
            
            RUNNING_COUNT=$((RUNNING_COUNT + 1))
        else
            echo "❌ $SERVICE_NAME"
            echo "   PID file exists but process not running"
            echo "   Last PID: $PID"
        fi
    else
        echo "⚪ $SERVICE_NAME"
        echo "   Not started (no PID file)"
    fi
    
    echo ""
}

echo "📍 UNIFIED SERVICES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_service "Unified Gateway (External)" "pids/unified_gateway.pid" "3000"
check_service "Unified Backend (Internal)" "pids/unified_backend.pid" "8080"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary: $RUNNING_COUNT/$TOTAL_COUNT services running"
echo ""

if [ $RUNNING_COUNT -eq $TOTAL_COUNT ]; then
    echo "✅ All services are running!"
    echo ""
    echo "🌐 Access your application at:"
    echo "   http://localhost:3000"
    echo "   http://163.61.183.90:3000"
elif [ $RUNNING_COUNT -eq 0 ]; then
    echo "⚠️  No services running"
    echo "   Run: ./START_UNIFIED.sh"
else
    echo "⚠️  Some services are not running"
    echo "   Run: ./START_UNIFIED.sh"
fi

echo ""
echo "📝 View logs:"
echo "   • Gateway: tail -f logs/unified_gateway.log"
echo "   • Backend: tail -f logs/unified_backend.log"
echo ""

