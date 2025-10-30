@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🛑 PIONE AGROTWIN - DỪNG TẤT CẢ SERVICES                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Đang dừng tất cả Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Đã dừng Node.js services
) else (
    echo ⚠️  Không tìm thấy Node.js processes
)

echo.
echo 🛑 Đang dừng tất cả Python processes...
taskkill /F /IM python.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Đã dừng Python services
) else (
    echo ⚠️  Không tìm thấy Python processes
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ ĐÃ DỪNG TẤT CẢ SERVICES!                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause

