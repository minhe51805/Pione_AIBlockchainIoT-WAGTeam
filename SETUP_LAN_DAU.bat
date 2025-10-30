@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🔧 PIONE AGROTWIN - CÀI ĐẶT LẦN ĐẦU TIÊN               ║
echo ║                                                            ║
echo ║   Chỉ cần chạy file này 1 LẦN DUY NHẤT                    ║
echo ║   Thời gian: 2-5 phút (tuỳ tốc độ mạng)                   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js không được cài đặt!
    echo    Vui lòng cài Node.js 18+ từ: https://nodejs.org
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python không được cài đặt!
    echo    Vui lòng cài Python 3.8+ từ: https://www.python.org
    pause
    exit /b 1
)

echo ✅ Node.js: OK
node --version
echo ✅ Python: OK
python --version
echo.

echo ════════════════════════════════════════════════════════════
echo 📦 ĐANG CÀI ĐẶT DEPENDENCIES...
echo ════════════════════════════════════════════════════════════
echo.

REM Install root Node.js packages
echo [1/4] 📦 Cài đặt Node.js packages (Root - Blockchain Bridge)...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Lỗi cài đặt root Node.js packages!
    pause
    exit /b 1
)
echo.
echo ✅ [1/4] Root packages: HOÀN TẤT
echo.

REM Install Backend packages
echo [2/4] 📦 Cài đặt Backend API packages...
echo.
cd Dapp\backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Lỗi cài đặt Backend packages!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.
echo ✅ [2/4] Backend packages: HOÀN TẤT
echo.

REM Install Frontend packages
echo [3/4] 📦 Cài đặt Frontend packages (Next.js)...
echo.
cd Dapp\frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Lỗi cài đặt Frontend packages!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.
echo ✅ [3/4] Frontend packages: HOÀN TẤT
echo.

REM Install Python packages
echo [4/4] 🐍 Cài đặt Python packages (AI Service)...
echo.
pip install -r ai_service\requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ❌ Lỗi cài đặt Python packages!
    echo    Thử chạy: python -m pip install --upgrade pip
    pause
    exit /b 1
)
echo.
echo ✅ [4/4] Python packages: HOÀN TẤT
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!                         ║
echo ║                                                            ║
echo ║   Bước tiếp theo:                                         ║
echo ║   1. Đảm bảo PostgreSQL đang chạy                         ║
echo ║   2. Cấu hình file .env (nếu chưa có)                     ║
echo ║   3. Click vào: START.bat để khởi động hệ thống          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause

