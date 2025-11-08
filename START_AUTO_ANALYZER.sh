#!/bin/bash

echo "🤖 Starting AI Auto Analyzer..."
echo "   ⏰ Schedule: Every 5 minutes"
echo ""

cd /root/Pione_AIBlockchainIoT-WAGTeam

# Check if already running
if [ -f pids/ai_auto_analyzer.pid ]; then
    OLD_PID=$(cat pids/ai_auto_analyzer.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "⚠️  Auto Analyzer already running (PID: $OLD_PID)"
        echo "   Use ./STOP_AUTO_ANALYZER.sh to stop it first"
        exit 1
    fi
fi

# Start auto analyzer
nohup python3 -u ai_auto_analyzer.py > logs/ai_auto_analyzer.log 2>&1 &
PID=$!
echo $PID > pids/ai_auto_analyzer.pid

sleep 2

# Check if started successfully
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ AI Auto Analyzer started (PID: $PID)"
    echo ""
    echo "📝 View logs: tail -f logs/ai_auto_analyzer.log"
    echo "🛑 Stop: ./STOP_AUTO_ANALYZER.sh"
else
    echo "❌ Failed to start Auto Analyzer"
    echo "   Check logs: tail logs/ai_auto_analyzer.log"
    exit 1
fi

