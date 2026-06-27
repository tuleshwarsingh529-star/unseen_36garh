@echo off
REM CG Tourism Backend Startup Script
set NODE_ENV=production
set PORT=4000
set DATABASE_URL=file:./dev.db
set JWT_SECRET=cg_tourism_jwt_secret_key_2026_bastar
set JWT_EXPIRES_IN=7d
set CORS_ALLOWED_ORIGINS=http://localhost:3000,https://cg-tourism.vercel.app
cd /d "%~dp0apps\backend"
node dist\src\main.js
