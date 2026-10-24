@echo off
chcp 65001 >nul
title Up You Go - 外网访问隧道
cd /d "%~dp0"

set CF=%~dp0..\up-you-go-assets\cloudflared\cloudflared.exe

if not exist "%CF%" (
  echo [错误] 未找到 cloudflared.exe，请先下载：
  echo https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  echo 保存到 up-you-go-assets\cloudflared\cloudflared.exe
  pause
  exit /b 1
)

netstat -ano | findstr ":4173" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [错误] 绘本网页服务(4173)未启动，请先双击「启动绘本网页.bat」。
  pause
  exit /b 1
)

echo [启动] 正在连接 Cloudflare 隧道...
echo 请稍等，出现 "Your quick Tunnel has been created" 后，
echo 复制其中的 https://xxx.trycloudflare.com 地址到 iPad 浏览器打开。
echo 保持本窗口开启即保持外网可用；关闭或 Ctrl+C 即断开。
echo.
"%CF%" tunnel --url http://localhost:4173 --no-autoupdate
pause