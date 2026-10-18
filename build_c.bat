@echo off
echo ========================================================
echo SmartSeat - Building Native C Seating Engine (Windows)
echo ========================================================

where gcc >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] GCC compiler not found in system PATH.
    echo Please install MSYS2 or MinGW-w64 and add gcc to your environment PATH.
    echo The SmartSeat system will safely use the Python Greedy Fallback in the meantime.
    exit /b 1
)

if not exist "backend\c_engine" (
    mkdir backend\c_engine
)

echo Compiling backend\c_engine\seat_engine.c ...
gcc -O3 -std=c99 -Wall -Wextra backend\c_engine\seat_engine.c -o backend\c_engine\seat_engine.exe

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] seat_engine.exe successfully built!
    echo Binary located at: backend\c_engine\seat_engine.exe
) else (
    echo [ERROR] Compilation failed.
    exit /b 1
)
