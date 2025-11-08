#!/bin/bash

# Enable UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🔧 PIONE AGROTWIN - CÀI ĐẶT LẦN ĐẦU TIÊN                ║"
echo "║                                                            ║"
echo "║   Chỉ cần chạy file này 1 LẦN DUY NHẤT                    ║"
echo "║   Thời gian: 2-5 phút (tùy tốc độ mạng)                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ----------------- CHECK NODE.JS -----------------
echo "👉 Kiểm tra Node.js..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js chưa được cài!"
    echo "   Cài Node.js 18+ tại: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# ----------------- CHECK PYTHON -----------------
echo "👉 Kiểm tra Python..."
if ! command -v python3 &> /dev/null
then
    echo "❌ Python3 chưa được cài!"
    echo "   Cài Python 3.8+ tại: https://www.python.org"
    exit 1
fi

echo "✅ Python: $(python3 --version)"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📦 ĐANG CÀI ĐẶT DEPENDENCIES..."
echo "════════════════════════════════════════════════════════════"
echo ""

# ----------------- [1/4] ROOT PACKAGES -----------------
echo "[1/4] 📦 Cài đặt Node.js packages (Root - Blockchain Bridge)..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt root Node.js packages!"
    exit 1
fi
echo "✅ [1/4] Root packages: HOÀN TẤT"
echo ""

# ----------------- [2/4] BACKEND PACKAGES -----------------
echo "[2/4] 📦 Cài đặt Backend API packages..."
cd Dapp/backend || exit
npm install
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt Backend packages!"
    cd ../..
    exit 1
fi
cd ../..
echo "✅ [2/4] Backend packages: HOÀN TẤT"
echo ""

# ----------------- [3/4] FRONTEND PACKAGES -----------------
echo "[3/4] 📦 Cài đặt Frontend packages (Next.js)..."
cd Dapp/frontend || exit
npm install
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt Frontend packages!"
    cd ../..
    exit 1
fi
cd ../..
echo "✅ [3/4] Frontend packages: HOÀN TẤT"
echo ""

# ----------------- [4/4] PYTHON PACKAGES -----------------
echo "[4/4] 🐍 Cài đặt Python packages (AI Service)..."
python3 -m pip install -r ai_service/requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt Python packages!"
    echo "   Thử chạy: python3 -m pip install --upgrade pip"
    exit 1
fi
echo "✅ [4/4] Python packages: HOÀN TẤT"
echo ""

# ----------------- DONE -----------------
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!                          ║"
echo "║                                                            ║"
echo "║   Bước tiếp theo:                                          ║"
echo "║   1. Đảm bảo PostgreSQL đang chạy                          ║"
echo "║   2. Cấu hình file .env (nếu chưa có)                      ║"
echo "║   3. Chạy: ./START.sh để khởi động hệ thống                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
