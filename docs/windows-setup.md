# Windows環境でのユーザーガイド

このドキュメントでは、開発者でない人がWindows環境で広聴AI（kouchou-ai）を使うための手順を説明します。
ソフトウェア開発に必要な要素を取り除いて最小限にしたものです。

## 前提条件

- Windows 10/11
- インターネット接続
- OpenAI APIキー（[取得方法](https://platform.openai.com/api-keys)）

## セットアップ手順

### 1. Docker Desktopのインストール

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)をダウンロードしてインストールします。
2. インストール後、Docker Desktopを起動します。
3. タスクバーのDockerアイコンが実行中（緑色）になっていることを確認します。

### 2. 広聴AIのダウンロード

1. [広聴AI最新版](https://github.com/digitaldemocracy2030/kouchou-ai/archive/refs/heads/main.zip)をzipファイルでダウンロードします。
2. ダウンロードしたzipファイルを任意の場所に展開します。

### 3. OpenAI APIキーの準備

1. [OpenAI API](https://platform.openai.com/api-keys)にアクセスし、APIキーを取得します。
2. アカウントに$5程度のクレジットをチャージしておくことをお勧めします。

### 4. セットアップの実行

1. 展開したフォルダ内の`setup_win.bat`ファイルをダブルクリックします。
2. プロンプトが表示されたら、OpenAI APIキーを入力します。
3. セットアップが自動的に進行し、Dockerコンテナが起動します。

### 5. アプリケーションへのアクセス

セットアップが完了すると、以下のURLでアプリケーションにアクセスできます：

- レポート閲覧画面: http://localhost:3000
- 管理画面: http://localhost:4000

### 6. アプリケーションのアクセス・運用と再起動の手順

セットアップ後は、次回以降の起動や停止を以下のように行ってください。

#### 通常の起動・停止

- アプリケーションの起動:  
  フォルダ内の `start_win.bat` をダブルクリックします（または Docker デスクトップから操作）

- アプリケーションの停止:  
  `stop_win.bat` をダブルクリックします（または Docker デスクトップから操作）

#### OpenAI APIキーを変更したい場合

OpenAI APIキーを再設定したい場合は、再度 `setup_win.bat` を実行してください。

1. 既存のアプリケーションが起動中の場合は `stop_win.bat` で停止してください。  
2. `setup_win.bat` を実行し、新しい APIキーを入力します。  
3. 自動的に再ビルドと起動が行われます。

> ※ `setup_win.bat` の再実行では、既存の `.env` ファイルが上書きされます。

## トラブルシューティング

### Docker Desktopが起動していない場合

エラーメッセージ「Docker Desktopが実行されていません」が表示された場合は、Docker Desktopを起動してから再度`setup_win.bat`を実行してください。

### WSL2の有効化が必要な場合

Docker Desktopの初回起動時にWSL2の有効化を求められた場合は、指示に従ってWSL2を有効化してください。詳細は[Microsoft公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/install)を参照してください。

### メモリ不足エラーが発生する場合

Docker Desktopの設定からリソース割り当て（メモリ、CPU）を増やしてください。推奨設定：

- メモリ: 4GB以上
- CPU: 2コア以上
