@echo off
setlocal
echo ===================================================
echo Starting CG Tourism Local Environment
echo ===================================================

:: Get the directory where this script is located
set APP_DIR=%~dp0

:: Start the backend in a new command prompt window
echo Starting Backend Server on port 4000...
start "CG Tourism Backend" cmd /c "cd /d "%APP_DIR%" && start-backend.bat"

:: Start the frontend in a new command prompt window
echo Starting Frontend Server on port 3000...
start "CG Tourism Frontend" cmd /c "cd /d "%APP_DIR%" && start-frontend.bat"

echo.
echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo Opening the application in your default browser...
start http://localhost:3000

echo.
echo All services launched! You can close this window.
timeout /t 3 >nul
exit
