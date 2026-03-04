@echo off
REM Quick Start Script for Hotel Feature
REM This script tests MongoDB and starts both server and client

echo.
echo ====================================================
echo   Hotel Feature - Quick Start
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: Node.js is not installed or not in PATH
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)

REM Navigate to server directory
cd /d "%~dp0server"

REM Test MongoDB Connection
echo Testing MongoDB Connection...
node test-mongodb-connection.js

if %errorlevel% neq 0 (
  echo.
  echo MongoDB connection failed!
  echo Please fix the connection and try again.
  echo.
  echo Options:
  echo 1. Run: node setup-mongodb.js (to reconfigure)
  echo 2. Start local MongoDB with: mongod
  echo 3. Check MONGO_URI in .env file
  echo.
  pause
  exit /b 1
)

echo.
echo ====================================================
echo Starting Hotel Feature...
echo ====================================================
echo.

REM Start backend
echo Starting Backend Server on http://localhost:5000
start "Backend Server" cmd /k "npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo Starting Frontend on http://localhost:5173
cd /d "%~dp0client"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ====================================================
echo Servers Starting...
echo ====================================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
