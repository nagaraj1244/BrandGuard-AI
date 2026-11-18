@echo off
title BrandGuard AI Platform
echo ========================================================
echo        BrandGuard AI - Intelligent Governance Engine
echo ========================================================
echo.
echo Checking port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo Starting BrandGuard AI Server...
echo.
echo Local PC: http://localhost:5000
echo.
start http://localhost:5000
node server/src/index.js
pause
