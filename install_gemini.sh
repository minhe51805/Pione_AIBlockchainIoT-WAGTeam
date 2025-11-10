#!/bin/bash

echo "🤖 Installing Google Gemini AI SDK..."
pip3 install -q google-generativeai tenacity

if [ $? -eq 0 ]; then
    echo "✅ Gemini SDK installed successfully!"
else
    echo "❌ Failed to install Gemini SDK"
    exit 1
fi

echo ""
echo "🔄 Restarting backend..."
cd /root/Pione_AIBlockchainIoT-WAGTeam
pkill -f "python.*unified_backend"
sleep 2

nohup python3 -u unified_backend.py > logs/unified_backend.log 2>&1 &
echo $! > pids/unified_backend.pid

sleep 3
echo ""
echo "📋 Backend logs (last 30 lines):"
tail -30 logs/unified_backend.log

echo ""
echo "✅ Done! Gemini AI is now active!"

