@echo off
title BrandGuard AI Platform
echo ========================================================
echo        BrandGuard AI - Intelligent Governance Engine
echo ========================================================
echo.
echo Starting BrandGuard AI Engine on port 5000...
echo.
echo - Local PC:        http://localhost:5000
echo - Mobile / Wi-Fi:  http://172.16.20.70:5000
echo - Public Worldwide: Run start-public.bat
echo.
echo Opening your browser to http://localhost:5000 ...
start http://localhost:5000
node server/src/index.js
pause
