@echo off
REM CG Tourism Frontend Startup Script
set NODE_ENV=production
set PORT=3000
set NEXT_PUBLIC_API_URL=http://localhost:4000
cd /d "%~dp0apps\web"
node node_modules\next\dist\bin\next start
