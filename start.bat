@echo off
echo.
echo ============================================
echo   PrimeBroward CRM - Starting Application
echo ============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Starting Python API server...
cd server
start "PrimeBroward API" cmd /k "python run.py"
cd ..

echo Waiting for API to start...
timeout /t 3 /nobreak >nul

echo Starting React frontend...
start "PrimeBroward Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo   Application Started!
echo ============================================
echo.
echo   API Server: http://127.0.0.1:8000
echo   API Docs:   http://127.0.0.1:8000/docs
echo   Frontend:   http://localhost:5173
echo.
echo   Press any key to close this window...
pause >nul



