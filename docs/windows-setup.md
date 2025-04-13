# Windows環境でのセットアップ手順

このドキュメントでは、Windows環境で広聴AI（kouchou-ai）をセットアップする手順を説明します。

## 前提条件

- Windows 10/11
- インターネット接続
- OpenAI APIキー（[取得方法](https://platform.openai.com/api-keys)）

## セットアップ手順

### 1. Docker Desktopのインストール

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)をダウンロードしてインストールします。
2. インストール後、Docker Desktopを起動します。
3. タスクバーのDockerアイコンが実行中（緑色）になっていることを確認します。

### 2. リポジトリのダウンロード

1. [kouchou-aiリポジトリ](https://github.com/digitaldemocracy2030/kouchou-ai/archive/refs/heads/main.zip)をzipファイルでダウンロードします。
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

## トラブルシューティング

### Docker Desktopが起動していない場合

エラーメッセージ「Docker Desktopが実行されていません」が表示された場合は、Docker Desktopを起動してから再度`setup_win.bat`を実行してください。

### WSL2の有効化が必要な場合

Docker Desktopの初回起動時にWSL2の有効化を求められた場合は、指示に従ってWSL2を有効化してください。詳細は[Microsoft公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/install)を参照してください。

### メモリ不足エラーが発生する場合

Docker Desktopの設定からリソース割り当て（メモリ、CPU）を増やしてください。推奨設定：

- メモリ: 4GB以上
- CPU: 2コア以上

## 技術的な詳細

このセットアップスクリプトは、Docker-outside-of-Docker（DooD）方式を使用しています。Windows環境の違いによる問題を回避し、一貫した環境でアプリケーションを実行するための方法です。

Docker Desktopを使用する場合、以下の利点があります：
- Docker Desktopはインストール時にDockerコマンドをWindowsのPATHに自動的に追加するため、batファイルから直接参照可能です
- Docker Desktop自体がLinux環境を提供するため、別途Ubuntuイメージは必要ありません
- セットアップが簡素化され、技術的な知識が少ないユーザーでも簡単に利用できます
