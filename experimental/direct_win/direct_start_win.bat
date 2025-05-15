@echo off
setlocal

@echo off
setlocal enabledelayedexpansion

rem === Check if .env exists ===
if not exist ".env" (
    echo [ERROR] .env file not found.
    echo Please create it using the following steps:
    echo   1. Copy .env.example to .env
    echo   2. Edit environment variables - see .env.example for details
    echo.
    pause
    exit /b 1
)

rem ----- Initialization -----
set CLIENT_ENV=client\.env
set ADMIN_ENV=client-admin\.env
set SERVER_ENV=server\.env

(del %CLIENT_ENV%) >nul 2>&1
(del %ADMIN_ENV%) >nul 2>&1
(del %SERVER_ENV%) >nul 2>&1

rem ----- Parse .env and generate per-service env files -----
echo [STEP 1] .env 分割バッチを実行中...
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    set KEY=%%A
    set VALUE=%%B

    rem Skip empty lines and comments
    echo !KEY! | findstr /b "#" >nul && (
        rem skip comment
    ) || if not "!KEY!"=="" (
        rem server env
        if /i "!KEY!"=="OPENAI_API_KEY" (
            echo !KEY!=!VALUE!>>%SERVER_ENV%
        ) else if /i "!KEY!"=="PUBLIC_API_KEY" (
            echo !KEY!=!VALUE!>>%SERVER_ENV%
        ) else if /i "!KEY!"=="ADMIN_API_KEY" (
            echo !KEY!=!VALUE!>>%SERVER_ENV%
        ) else if /i "!KEY!"=="ENVIRONMENT" (
            echo !KEY!=!VALUE!>>%SERVER_ENV%
        ) else if /i "!KEY!"=="STORAGE_TYPE" (
            echo !KEY!=!VALUE!>>%SERVER_ENV%
        )

        rem client env
        if /i "!KEY!"=="NEXT_PUBLIC_API_BASEPATH" (
            echo !KEY!=!VALUE!>>%CLIENT_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_PUBLIC_API_KEY" (
            echo !KEY!=!VALUE!>>%CLIENT_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_SITE_URL" (
            echo !KEY!=!VALUE!>>%CLIENT_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_GA_MEASUREMENT_ID" (
            echo !KEY!=!VALUE!>>%CLIENT_ENV%
        )

        rem client-admin env
        if /i "!KEY!"=="NEXT_PUBLIC_CLIENT_BASEPATH" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_API_BASEPATH" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_ADMIN_API_KEY" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        ) else if /i "!KEY!"=="BASIC_AUTH_USERNAME" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        ) else if /i "!KEY!"=="BASIC_AUTH_PASSWORD" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        ) else if /i "!KEY!"=="NEXT_PUBLIC_ADMIN_GA_MEASUREMENT_ID" (
            echo !KEY!=!VALUE!>>%ADMIN_ENV%
        )
    )
)

echo [INFO] .envからPYTHON_EXECUTABLEを読み込みます...

rem --- 初期値：.venv を使う ---
set "PYTHON_EXECUTABLE=.venv\Scripts\python.exe"

rem --- .env ファイルから PYTHON_EXECUTABLE を探して上書き（あれば） ---
for /f "tokens=1,* delims==" %%A in (.env) do (
    if /i "%%A"=="PYTHON_EXECUTABLE" (
        set "PYTHON_EXECUTABLE=%%B"
    )
)

echo [INFO] 使用するPython: %PYTHON_EXECUTABLE%
rem ----------- Launch all services ------------
rem ----------- APIサーバ（FastAPI）起動 ------------
echo [STEP 2] FastAPI サーバー起動中（別ウィンドウ）...
start "server" cmd /k "cd server && %PYTHON_EXECUTABLE% -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug"

rem ----------- クライアント起動（client） ------------
echo [STEP 3] client を起動中（別ウィンドウ）...
start "client" cmd /k "cd client && npm run dev"

rem ----------- 管理画面（client-admin）起動 ------------
echo [STEP 4] client-admin を起動中（別ウィンドウ）...
start "client-admin" cmd /k "cd client-admin && npm run dev"

echo [DONE] すべてのサービスを起動しました。終了する場合は各ウインドウを閉じてください。
pause