@echo off
title BrandGuard AI - Public Worldwide Tunnel
echo ============================================================
echo       BRANDGUARD AI - PUBLIC & MOBILE WORLDWIDE ACCESS       
echo ============================================================
echo.
echo [1/2] Starting BrandGuard AI local server...
start "BrandGuard Server" cmd /k "node server/src/index.js"
timeout /t 2 >nul

echo.
echo [2/2] Generating secure public HTTPS tunnel with Localtunnel...
echo.
echo ------------------------------------------------------------
echo Anyone on any mobile phone (iPhone/Android) or PC worldwide
echo can access this public link:
echo ------------------------------------------------------------
echo.
cmd /c "npx -y localtunnel --port 5000"
pause

