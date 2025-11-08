#!/bin/bash

echo "🛑 Stopping AI Auto Analyzer..."

cd /root/Pione_AIBlockchainIoT-WAGTeam

if [ ! -f pids/ai_auto_analyzer.pid ]; then
    echo "⚠️  PID file not found"
    exit 1
fi

PID=$(cat pids/ai_auto_analyzer.pid)

if ! ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Process not running (PID: $PID)"
    rm pids/ai_auto_analyzer.pid
    exit 0
fi

# Graceful shutdown
kill $PID 2>/dev/null

# Wait up to 5 seconds
for i in {1..5}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ AI Auto Analyzer stopped"
        rm pids/ai_auto_analyzer.pid
        exit 0
    fi
    sleep 1
done

# Force kill if still running
kill -9 $PID 2>/dev/null
echo "✅ AI Auto Analyzer force stopped"
rm pids/ai_auto_analyzer.pid

