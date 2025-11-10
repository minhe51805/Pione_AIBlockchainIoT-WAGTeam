#!/bin/bash

# Quick Status Check - Simplified version of STATUS.sh
cd "$(dirname "$0")"

# Colors
G='\033[0;32m'  # Green
R='\033[0;31m'  # Red  
Y='\033[1;33m'  # Yellow
B='\033[0;34m'  # Blue
NC='\033[0m'    # No Color

echo ""
echo "🚀 ${B}PIONE AGROTWIN - Quick Status${NC}"
echo "═══════════════════════════════════════════════"

# Check main services
check_service() {
    local name="$1"
    local pid_file="$2" 
    local port="$3"
    
    printf "%-20s" "$name"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        if [ -n "$pid" ] && ps -p "$pid" >/dev/null 2>&1; then
            printf "${G}✅ Running${NC} (PID: $pid)"
            if [ -n "$port" ] && netstat -tln 2>/dev/null | grep -q ":$port "; then
                printf " ${G}Port: $port${NC}"
            fi
            echo ""
        else
            printf "${R}❌ Stopped${NC}\n"
        fi
    else
        printf "${R}❌ Not Found${NC}\n"
    fi
}

check_service "Backend" "pids/unified_backend.pid" "8080"
check_service "Gateway" "pids/unified_gateway.pid" "3000" 
check_service "AI Analyzer" "pids/ai_auto_analyzer.pid"

echo "═══════════════════════════════════════════════"

# Quick connection test
printf "Frontend:           "
if curl -s -m 2 "http://localhost:3000/" >/dev/null 2>&1; then
    echo "${G}✅ OK${NC}"
else
    echo "${R}❌ Failed${NC}"
fi

printf "API:                "
if curl -s -m 2 "http://localhost:3000/api/dashboard/overview" >/dev/null 2>&1; then
    echo "${G}✅ OK${NC}"
else  
    echo "${R}❌ Failed${NC}"
fi

echo "═══════════════════════════════════════════════"
echo "📝 ${Y}Full status:${NC} ./STATUS.sh"
echo "🚀 ${Y}Start system:${NC} ./START_UNIFIED.sh"
echo "🛑 ${Y}Stop system:${NC}  ./STOP_UNIFIED.sh"
echo ""