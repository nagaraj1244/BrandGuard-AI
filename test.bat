@echo off
title BrandGuard AI Test Suite
echo ========================================================
echo       BrandGuard AI - Comprehensive Test Suite
echo ========================================================
echo.
echo [1/2] Running Core AI & Violation Detection Engine Tests...
node server/test/test-engine.js
echo.
echo [2/2] Running Authentication, JWT & User Management Tests...
node server/test/test-auth.js
echo.
echo ========================================================
echo All unit and integration test suites completed!
echo ========================================================
echo.
pause
