#!/bin/bash

# Enable UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🔥 PIONE AGROTWIN - CẤU HÌNH FIREWALL                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🔍 Kiểm tra firewall hiện tại..."
echo ""

# Check if UFW is installed
if command -v ufw &> /dev/null; then
    echo "✅ UFW đã được cài đặt"
    
    # Enable UFW if not enabled
    if ! ufw status | grep -q "Status: active"; then
        echo "🔧 Đang bật UFW..."
        ufw --force enable
    fi
    
    echo ""
    echo "🔓 Mở các port cần thiết..."
    
    # Allow SSH (important!)
    ufw allow 22/tcp
    echo "  ✅ Port 22 (SSH) - đã mở"
    
    # Allow Frontend
    ufw allow 3000/tcp
    echo "  ✅ Port 3000 (Frontend Next.js) - đã mở"
    
    # Allow Backend API
    ufw allow 3001/tcp
    echo "  ✅ Port 3001 (Backend API) - đã mở"
    
    # Allow AI Service
    ufw allow 8000/tcp
    echo "  ✅ Port 8000 (AI Service) - đã mở"
    
    # Allow HTTP/HTTPS (optional)
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "  ✅ Port 80/443 (HTTP/HTTPS) - đã mở"
    
    echo ""
    echo "📊 Trạng thái firewall:"
    ufw status numbered
    
elif command -v firewall-cmd &> /dev/null; then
    echo "✅ FirewallD đã được cài đặt"
    
    echo ""
    echo "🔓 Mở các port cần thiết..."
    
    # Add ports
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=3001/tcp
    firewall-cmd --permanent --add-port=8000/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    
    # Reload
    firewall-cmd --reload
    
    echo "  ✅ Đã mở tất cả các port cần thiết"
    echo ""
    echo "📊 Trạng thái firewall:"
    firewall-cmd --list-ports
    
else
    echo "⚠️  Không tìm thấy UFW hoặc FirewallD"
    echo "   Có thể firewall chưa được cài đặt hoặc VPS không có firewall"
    echo ""
    echo "🔍 Kiểm tra iptables..."
    
    if command -v iptables &> /dev/null; then
        echo "  ✅ iptables có sẵn"
        echo ""
        echo "📊 Các rule hiện tại:"
        iptables -L -n | head -20
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ ĐÃ CẤU HÌNH FIREWALL!                                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 LƯU Ý:"
echo "  • Nếu vẫn không truy cập được, kiểm tra firewall của VPS provider"
echo "  • Một số VPS có firewall riêng trên control panel"
echo "  • Kiểm tra Security Group / Network ACL nếu dùng cloud VPS"
echo ""
echo "🔍 Kiểm tra port đang lắng nghe:"
netstat -tlnp 2>/dev/null | grep -E '3000|3001|8000' || ss -tlnp 2>/dev/null | grep -E '3000|3001|8000'
echo ""
