@echo off
chcp 65001 >nul
rem 启动开发服务器，实时预览项目
cd /d "%~dp0"

echo 正在启动开发服务器...
echo 启动后将自动打开浏览器，按 Ctrl+C 可停止服务器。
echo.
call npm run dev
pause
