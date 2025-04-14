@echo on
echo Kouchou-AI Setup Tool
echo =====================

REM Check if Docker Desktop is running
docker info > nul 2>&1
if %errorlevel% neq 0 (
  echo Docker Desktop is not running.
  echo Please start Docker Desktop and try again.
  pause
  exit /b
)

REM Enter OpenAI API key
set /p OPENAI_API_KEY=Enter your OpenAI API key: 

REM Generate .env file
echo # Auto-generated .env file > .env
echo OPENAI_API_KEY=%OPENAI_API_KEY% >> .env
echo PUBLIC_API_KEY=public >> .env
echo ADMIN_API_KEY=admin >> .env
echo ENVIRONMENT=development >> .env
echo STORAGE_TYPE=local >> .env
echo NEXT_PUBLIC_PUBLIC_API_KEY=public >> .env
echo NEXT_PUBLIC_ADMIN_API_KEY=admin >> .env
echo NEXT_PUBLIC_CLIENT_BASEPATH=http://localhost:3000 >> .env
echo NEXT_PUBLIC_API_BASEPATH=http://localhost:8000 >> .env
echo API_BASEPATH=http://api:8000 >> .env
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env

REM Start the environment
echo Starting Docker environment...
docker compose up -d

echo.
echo Setup completed!
echo You can now access the following URLs in your browser:
echo   http://localhost:3000 - Report Viewer
echo   http://localhost:4000 - Admin Panel
echo.
pause