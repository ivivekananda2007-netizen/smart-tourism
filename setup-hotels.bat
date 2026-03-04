@echo off
REM Hotels Near Gems - Quick Setup Script
REM This script sets up the hotels feature for the trip planner

echo.
echo ========================================
echo   Hotels Near Hidden Gems Setup
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo ERROR: Please run this script from the trip-plan root directory
    exit /b 1
)

echo [1/3] Installing dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    exit /b 1
)
echo ✓ Server dependencies installed

echo.
echo [2/3] Seeding hotels data...
call node scripts/seed-hotels.js
if errorlevel 1 (
    echo ERROR: Failed to seed hotels
    exit /b 1
)
echo ✓ Hotels data seeded

echo.
echo [3/3] Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    exit /b 1
)
echo ✓ Client dependencies installed

echo.
echo ========================================
echo   ✓ Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Terminal 1 (Backend):
echo      cd server
echo      npm run dev
echo.
echo   2. Terminal 2 (Frontend):
echo      cd client
echo      npm run dev
echo.
echo Then visit: http://localhost:5173
echo Go to Hidden Gems page and click on any gem to see nearby hotels!
echo.
pause
