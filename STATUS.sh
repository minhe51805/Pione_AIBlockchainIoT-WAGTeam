#!/bin/bash

# Enable UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Move to folder where script is located
cd "$(dirname "$0")"

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🌾 PIONE AGROTWIN - SYSTEM STATUS 🌾                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

print_status() {
    local service="$1"
    local pid_file="$2"
    local port="$3"
    local process_name="$4"
    
    printf "%-25s" "$service:"
    
    # Check PID file
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
            # Process is running
            local cpu_mem=$(ps -p "$pid" -o %cpu,%mem --no-headers 2>/dev/null | tr -s ' ')
            printf "${GREEN}✅ RUNNING${NC} (PID: $pid)"
            if [ -n "$cpu_mem" ]; then
                printf " ${CYAN}[CPU:$cpu_mem]${NC}"
            fi
            
            # Check port if specified
            if [ -n "$port" ]; then
                if netstat -tlnp 2>/dev/null | grep -q ":$port.*$pid/" || ss -tlnp 2>/dev/null | grep -q ":$port.*pid=$pid"; then
                    printf " ${GREEN}[Port: $port ✓]${NC}"
                else
                    printf " ${YELLOW}[Port: $port ⚠]${NC}"
                fi
            fi
            echo ""
        else
            # PID file exists but process is dead
            printf "${RED}❌ DEAD${NC} (PID file: $pid, process not found)\n"
        fi
    else
        # No PID file, check by process name
        if [ -n "$process_name" ]; then
            local pids=$(pgrep -f "$process_name" 2>/dev/null)
            if [ -n "$pids" ]; then
                local pid_count=$(echo "$pids" | wc -l)
                printf "${YELLOW}⚠️  ORPHAN${NC} ($pid_count processes without PID file)\n"
                for pid in $pids; do
                    local cpu_mem=$(ps -p "$pid" -o %cpu,%mem --no-headers 2>/dev/null | tr -s ' ')
                    printf "%-25s${YELLOW}   → PID: $pid${NC}" ""
                    if [ -n "$cpu_mem" ]; then
                        printf " ${CYAN}[CPU:$cpu_mem]${NC}"
                    fi
                    echo ""
                done
            else
                printf "${RED}❌ STOPPED${NC} (no PID file, no process)\n"
            fi
        else
            printf "${RED}❌ STOPPED${NC} (no PID file)\n"
        fi
    fi
}

# ============================================================
# SERVICE STATUS
# ============================================================
echo "� ${WHITE}UNIFIED SERVICES STATUS:${NC}"
echo "============================================================"

print_status "Unified Backend" "pids/unified_backend.pid" "8080" "python3.*unified_backend"
print_status "AI Auto Analyzer" "pids/ai_auto_analyzer.pid" "" "python3.*ai_auto_analyzer"
print_status "Unified Gateway" "pids/unified_gateway.pid" "3000" "node.*gateway"

echo ""
echo "📊 ${WHITE}LEGACY SERVICES (if any):${NC}"
echo "============================================================"

print_status "Blockchain Bridge" "pids/blockchain_bridge.pid" "" "python3.*blockchain_bridge"
print_status "Data Ingest" "pids/data_ingest.pid" "" "python3.*app_ingest"
print_status "AI Service" "pids/ai_service.pid" "" "python3.*ai_service"
print_status "Backend API" "pids/backend.pid" "" "node.*server"
print_status "Frontend" "pids/frontend.pid" "" "npm.*dev"

echo "============================================================"
echo ""

# ============================================================
# PORT STATUS
# ============================================================
echo "🔌 ${WHITE}PORT STATUS:${NC}"
echo "============================================================"

check_port() {
    local port="$1"
    local service="$2"
    local result=$(netstat -tlnp 2>/dev/null | grep ":$port " | head -1)
    
    printf "Port %-6s" "$port:"
    if [ -n "$result" ]; then
        local pid=$(echo "$result" | awk '{print $NF}' | cut -d'/' -f1)
        local process=$(echo "$result" | awk '{print $NF}' | cut -d'/' -f2-)
        printf "${GREEN}✅ LISTENING${NC} → PID: $pid ($process) ${CYAN}[$service]${NC}\n"
    else
        printf "${RED}❌ CLOSED${NC} ${YELLOW}[$service not running]${NC}\n"
    fi
}

check_port "3000" "Unified Gateway"
check_port "8080" "Unified Backend" 
check_port "3001" "Frontend Dev Server"
check_port "8000" "Legacy AI Service"

echo ""

# ============================================================
# SYSTEM RESOURCES
# ============================================================
echo "💻 ${WHITE}SYSTEM RESOURCES:${NC}"
echo "============================================================"

# Memory usage
total_mem=$(free -h | awk '/^Mem:/ {print $2}')
used_mem=$(free -h | awk '/^Mem:/ {print $3}')
mem_percent=$(free | awk '/^Mem:/ {printf "%.1f", ($3/$2)*100}')

printf "Memory Usage:     ${CYAN}$used_mem / $total_mem${NC} (${YELLOW}$mem_percent%%${NC})\n"

# Disk usage
disk_usage=$(df -h . | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')
printf "Disk Usage:       ${CYAN}%s${NC}\n" "$disk_usage"

# Load average
load_avg=$(uptime | awk -F'load average:' '{print $2}' | xargs)
printf "Load Average:     ${CYAN}$load_avg${NC}\n"

# Project processes CPU & Memory
echo ""
project_processes=$(ps aux | grep -E "(python3.*(unified_backend|ai_auto_analyzer|app_ingest|ai_service)|node.*(gateway|server)|npm.*dev)" | grep -v grep)
if [ -n "$project_processes" ]; then
    echo "${WHITE}Project Process Resources:${NC}"
    echo "PID       %CPU  %MEM  COMMAND"
    echo "$project_processes" | awk '{printf "%-8s  %-5s %-5s %s\n", $2, $3, $4, substr($0, index($0,$11))}'
fi

echo ""

# ============================================================
# RECENT LOGS
# ============================================================
echo "📝 ${WHITE}RECENT LOGS (Last 5 lines each):${NC}"
echo "============================================================"

show_log() {
    local log_file="$1"
    local service_name="$2"
    
    echo ""
    echo "${PURPLE}► $service_name:${NC}"
    if [ -f "$log_file" ]; then
        echo "${BLUE}   File: $log_file${NC}"
        echo "   ────────────────────────────────────────"
        tail -5 "$log_file" 2>/dev/null | sed 's/^/   /'
        if [ $? -ne 0 ]; then
            echo "   ${RED}[Error reading log file]${NC}"
        fi
    else
        echo "   ${YELLOW}[Log file not found: $log_file]${NC}"
    fi
}

show_log "logs/unified_backend.log" "Unified Backend"
show_log "logs/ai_auto_analyzer.log" "AI Auto Analyzer" 
show_log "logs/unified_gateway.log" "Unified Gateway"

# Legacy logs
if [ -f "logs/blockchain_bridge.log" ] || [ -f "logs/data_ingest.log" ] || [ -f "logs/ai_service.log" ]; then
    echo ""
    echo "${WHITE}Legacy Service Logs:${NC}"
    show_log "logs/blockchain_bridge.log" "Blockchain Bridge"
    show_log "logs/data_ingest.log" "Data Ingest"
    show_log "logs/ai_service.log" "AI Service"
fi

echo ""

# ============================================================
# QUICK ACTIONS
# ============================================================
echo "⚡ ${WHITE}QUICK ACTIONS:${NC}"
echo "============================================================"
echo "   ${GREEN}Start System:${NC}      ./START_UNIFIED.sh"
echo "   ${RED}Stop System:${NC}       ./STOP_UNIFIED.sh"
echo "   ${BLUE}View Live Logs:${NC}    tail -f logs/unified_backend.log"
echo "   ${BLUE}                      tail -f logs/unified_gateway.log"
echo "   ${YELLOW}System Status:${NC}     ./STATUS.sh (this script)"
echo ""

# ============================================================
# CONNECTION TEST
# ============================================================
echo "🔗 ${WHITE}CONNECTION TEST:${NC}"
echo "============================================================"

test_endpoint() {
    local url="$1"
    local name="$2"
    printf "%-25s" "$name:"
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout 3 --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        printf "${GREEN}✅ OK${NC} (HTTP 200)\n"
    elif [ "$response" = "000" ]; then
        printf "${RED}❌ UNREACHABLE${NC} (Connection failed)\n"
    elif [ -n "$response" ]; then
        printf "${YELLOW}⚠️  HTTP $response${NC}\n"
    else
        printf "${RED}❌ TIMEOUT${NC}\n"
    fi
}

test_endpoint "http://localhost:3000/" "Frontend"
test_endpoint "http://localhost:3000/api/dashboard/overview" "API Gateway"
test_endpoint "http://localhost:8080/health" "Backend Health"

echo ""
echo "${GREEN}✅ Status check completed!${NC}"
echo ""
