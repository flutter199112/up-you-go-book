@echo off
chcp 65001 >nul
title Up You Go - 绘本学习网页
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 npm，请先安装 Node.js：https://nodejs.org/
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [1/3] 首次运行，正在构建...
  call npm install
  call npm run build
  if errorlevel 1 (
    echo [错误] 构建失败，请检查上方日志。
    pause
    exit /b 1
  )
)

netstat -ano | findstr ":4173" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [提示] 网页服务已在运行。
  echo 本机：  http://localhost:4173/
  start "" "http://localhost:4173/"
  pause
  exit /b 0
)

echo [2/3] 正在启动网页服务（端口 4173）...
echo [3/3] 启动成功后会自动打开浏览器。
echo 本机访问： http://localhost:4173/
echo 局域网设备（如 iPad）访问：http://本机IP:4173/（见下方 Network 地址）
echo 关闭本窗口即停止服务。按 Ctrl+C 可退出。
echo.
call npx vite preview --port 4173 --strictPort --host
pause