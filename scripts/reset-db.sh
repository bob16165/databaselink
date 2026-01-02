#!/bin/bash

# データベースをリセットして再起動
cd "$(dirname "$0")/.."

echo "データベースをリセットしています..."
rm -f database.json
npm run init-db

echo ""
echo "開発サーバーを再起動しています..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1
npm run dev
