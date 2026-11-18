@echo off
title BrandGuard AI - Free Port 5000
echo ============================================================
echo         Freeing Port 5000 from hanging processes...
echo ============================================================
echo.
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
  echo Terminating process PID %%a using port 5000...
  taskkill /F /PID %%a >nul 2>&1
)
echo.
echo Port 5000 is now free! You can run start.bat now.
echo.
pause
