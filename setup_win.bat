@echo off
echo 広聴AIセットアップツール
echo =====================

REM Docker Desktopが起動しているか確認
docker info > nul 2>&1
if %errorlevel% neq 0 (
  echo Docker Desktopが実行されていません。
  echo Docker Desktopを起動してから再度実行してください。
  pause
  exit /b
)

REM OpenAI APIキーの設定
set /p OPENAI_API_KEY="OpenAI APIキーを入力してください: "

REM .envファイルの作成
echo # 自動生成された.envファイル > .env
echo OPENAI_API_KEY=%OPENAI_API_KEY% >> .env
echo PUBLIC_API_KEY=public >> .env
echo ADMIN_API_KEY=admin >> .env
echo ENVIRONMENT=development >> .env
echo STORAGE_TYPE=local >> .env
echo NEXT_PUBLIC_PUBLIC_API_KEY=public >> .env
echo NEXT_PUBLIC_ADMIN_API_KEY=admin >> .env
echo NEXT_PUBLIC_CLIENT_BASEPATH=http://client:3000 >> .env
echo NEXT_PUBLIC_API_BASEPATH=http://api:8000 >> .env
echo API_BASEPATH=http://api:8000 >> .env
echo NEXT_PUBLIC_SITE_URL=http://client:3000 >> .env

REM 環境を起動
echo Docker環境を準備しています...
docker compose up -d

echo.
echo セットアップが完了しました！
echo ブラウザで以下のURLにアクセスできます：
echo   http://localhost:3000 - レポート閲覧画面
echo   http://localhost:4000 - 管理画面
echo.
pause
