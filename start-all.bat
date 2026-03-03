@echo off
REM Start Backend Server
echo Starting Backend Server on port 5000...
cd server
start cmd /k "npm run dev"
echo ✅ Backend server started in a new window

timeout /t 3

REM Start Frontend Server
echo Starting Frontend Server on port 5173...
cd ..\client
start cmd /k "npm run dev"
echo ✅ Frontend server started in a new window

echo.
echo 🎉 Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
