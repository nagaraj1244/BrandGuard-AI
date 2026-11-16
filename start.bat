@echo off
title BrandGuard AI Platform
echo ========================================================
echo        BrandGuard AI - Intelligent Governance Engine
echo ========================================================
echo.
echo Starting BrandGuard AI Engine on http://localhost:5000 ...
echo Opening your browser to http://localhost:5000 ...
echo.
start http://localhost:5000
node server/src/index.js
pause

