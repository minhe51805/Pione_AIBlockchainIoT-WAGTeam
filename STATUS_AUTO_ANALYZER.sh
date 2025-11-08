#!/bin/bash

echo "📊 AI Auto Analyzer Status"
echo "════════════════════════════════════════"

cd /root/Pione_AIBlockchainIoT-WAGTeam

if [ ! -f pids/ai_auto_analyzer.pid ]; then
    echo "❌ Not running (PID file not found)"
    exit 1
fi

PID=$(cat pids/ai_auto_analyzer.pid)

if ! ps -p $PID > /dev/null 2>&1; then
    echo "❌ Not running (Process $PID not found)"
    rm pids/ai_auto_analyzer.pid
    exit 1
fi

# Get process info
UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
MEMORY=$(ps -p $PID -o rss= | awk '{printf "%.1f MB", $1/1024}')

echo "✅ Running"
echo "   PID:     $PID"
echo "   Uptime:  $UPTIME"
echo "   Memory:  $MEMORY"
echo ""

# Show last few log lines
echo "📝 Recent Activity (last 10 lines):"
echo "────────────────────────────────────────"
tail -10 logs/ai_auto_analyzer.log 2>/dev/null || echo "No logs yet"

