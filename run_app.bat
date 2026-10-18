@echo off
echo ========================================================
echo Starting SmartSeat Examination Seating Management System
echo Windows 11 Full-Stack Launcher
echo ========================================================

REM Step 1: Attempt to compile C engine if GCC is available
call build_c.bat

REM Step 2: Check Node and Python
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required to run the frontend dashboard.
    pause
    exit /b 1
)

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python 3 is required for the backend services.
    pause
    exit /b 1
)

REM Step 3: Install dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Step 4: Launch backend in background window
echo Starting Python Flask Backend on port 5000...
start "SmartSeat Backend" cmd /k "python -m pip install -r backend\requirements.txt && python -m backend.app"

REM Step 5: Launch Vite Frontend Dev Server
echo Starting Vite Frontend Dashboard on port 3000...
call npm run dev
