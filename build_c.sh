#!/usr/bin/env bash
set -e

echo "========================================================"
echo "SmartSeat - Building Native C Seating Engine (Linux/macOS)"
echo "========================================================"

if ! command -v gcc &> /dev/null; then
    echo "[WARNING] gcc is not installed. Checking for clang..."
    if command -v clang &> /dev/null; then
        CC="clang"
    else
        echo "[ERROR] No C compiler found. Python fallback engine will be used."
        exit 0
    fi
else
    CC="gcc"
fi

mkdir -p backend/c_engine
echo "Compiling backend/c_engine/seat_engine.c with $CC -O3..."
$CC -O3 -std=c99 -Wall -Wextra backend/c_engine/seat_engine.c -o backend/c_engine/seat_engine

echo "[SUCCESS] seat_engine compiled successfully at backend/c_engine/seat_engine"
chmod +x backend/c_engine/seat_engine
