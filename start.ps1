# PrimeBroward CRM - PowerShell Startup Script

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PrimeBroward CRM - Starting Application" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install Python 3.10+ from https://python.org" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting Python API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; python run.py" -WindowStyle Normal

Write-Host "Waiting for API to initialize..."
Start-Sleep -Seconds 3

Write-Host "Starting React frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Application Started Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "   API Server: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "   Opening browser in 5 seconds..." -ForegroundColor Gray

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"



