@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🌾 PIONE AGROTWIN - SMART FARMING PLATFORM 🌾       ║
echo ║                                                            ║
echo ║  AI + Blockchain + IoT for Vietnamese Farmers            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo 🚀 ĐANG KHỞI ĐỘNG 5 SERVICES THEO ĐÚNG THỨ TỰ...
echo.

REM 1. Blockchain Bridge (server.js ROOT) - QUAN TRỌNG NHẤT
echo ⛓️  [1/5] Starting Blockchain Bridge (server.js)...
start "PIONE - Blockchain Bridge" cmd /k "node server.js"
echo      → Đợi 5 giây để Blockchain Bridge khởi động...
timeout /t 5 /nobreak >nul

REM 2. Data Ingest Service (app_ingest.py)
echo 📥 [2/5] Starting Data Ingest Service (app_ingest.py)...
start "PIONE - Data Ingest" cmd /k "python app_ingest.py"
echo      → Đợi 4 giây để Data Ingest khởi động...
timeout /t 4 /nobreak >nul

REM 3. AI Service (ai_service/main.py - Port 5000)
echo 🤖 [3/5] Starting AI Service (ai_service/main.py - Port 5000)...
start "PIONE - AI Service" cmd /k "cd ai_service && python main.py"
echo      → Đợi 4 giây để AI Service khởi động...
timeout /t 4 /nobreak >nul

REM 4. Backend API (Dapp/backend/server.js)
echo 🔧 [4/5] Starting Backend API (Dapp/backend/server.js)...
start "PIONE - Backend API" cmd /k "cd Dapp\backend && node server.js"
echo      → Đợi 3 giây để Backend API khởi động...
timeout /t 3 /nobreak >nul

REM 5. Frontend (Dapp/frontend - Port 3000)
echo 🌐 [5/5] Starting Frontend (Dapp/frontend - Port 3000)...
start "PIONE - Frontend" cmd /k "cd Dapp\frontend && npm run dev"
echo      → Đợi 5 giây để Frontend build lần đầu...
timeout /t 5 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ ĐÃ KHỞI ĐỘNG TẤT CẢ 5 SERVICES!                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ============================================================
echo 📍 THÔNG TIN TRUY CẬP:
echo ============================================================
echo   🌐 Frontend:          http://localhost:3000
echo   🤖 AI API:            http://localhost:5000
echo   📥 Data Ingest:       Xem cửa sổ "PIONE - Data Ingest"
echo   ⛓️  Blockchain Bridge: Xem cửa sổ "PIONE - Blockchain Bridge"
echo   🔧 Backend API:       Xem cửa sổ "PIONE - Backend API"
echo ============================================================
echo.
echo 💡 MỖI SERVICE CHẠY TRONG CỬA SỔ RIÊNG
echo 💡 ĐỢI 10-20 GIÂY ĐỂ TẤT CẢ KHỞI ĐỘNG XONG
echo 💡 ĐỂ DỪNG: ĐÓNG CÁC CỬA SỔ CMD
echo.
echo Mở trình duyệt và vào: http://localhost:3000
echo.

pause

