# セットアップガイド

## 1. 必要な環境のインストール

### Node.jsのインストール

macOSの場合、Homebrewを使用してインストールします：

```bash
# Homebrewのインストール（まだインストールしていない場合）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsのインストール
brew install node
```

インストール確認：
```bash
node --version
npm --version
```

## 2. プロジェクトのセットアップ

```bash
# プロジェクトディレクトリに移動
cd /Users/a.inoue/Desktop/databaselink

# 依存関係のインストール
npm install

# データベースの初期化（サンプルデータ込み）
npm run init-db
```

## 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## 4. ユーザーデータの準備

### 方法1: スクリプトで一括登録

1. `scripts/add-users.ts` を開く
2. `usersData` 配列に実際のユーザー情報を入力
3. 以下のコマンドを実行：

```bash
npx tsx scripts/add-users.ts
```

### 方法2: CSVファイルから登録（カスタムスクリプトが必要）

CSVファイルからユーザーを一括登録したい場合は、別途スクリプトを作成できます。

### ユーザーデータの形式

```typescript
{
  username: 'ログインID',     // 例: parent001
  password: 'パスワード',      // 例: secure_pass_123
  fullName: '保護者氏名'       // 例: 山田太郎
}
```

## 5. 記事（お知らせ）の追加

### 方法1: スクリプトで追加

1. `scripts/add-articles.ts` を開く
2. `articlesData` 配列に記事情報を入力
3. 以下のコマンドを実行：

```bash
npx tsx scripts/add-articles.ts
```

### 記事データの形式

```typescript
{
  title: 'お知らせのタイトル',
  content: '記事の内容（改行可能）',
  author: '投稿者名'
}
```

## 6. 本番環境へのデプロイ

### 環境変数の設定

`.env.local` ファイルを編集：

```
JWT_SECRET=ランダムで長い秘密鍵に変更してください
DATABASE_PATH=./database.db
```

### ビルドと起動

```bash
# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 7. トラブルシューティング

### データベースが見つからない

```bash
# データベースを再初期化
npm run init-db
```

### ログインできない

1. サンプルログイン情報を確認：
   - ユーザー名: `parent001`
   - パスワード: `password123`

2. データベースにユーザーが存在するか確認

### ポートが既に使用されている

別のポートで起動：
```bash
PORT=3001 npm run dev
```

## 8. データベースの管理

### データベースの場所

`database.db` ファイルがプロジェクトルートに作成されます。

### データベースのバックアップ

```bash
cp database.db database.db.backup
```

### データベースのリセット

```bash
rm database.db
npm run init-db
```

## 9. セキュリティ上の注意事項

- ✅ 本番環境では必ず `JWT_SECRET` を変更
- ✅ パスワードは十分に複雑なものを使用
- ✅ HTTPS を使用することを推奨
- ✅ 定期的にログイン履歴を確認
- ✅ データベースファイルのバックアップを取る

## 10. サポート

問題が発生した場合は、以下を確認してください：

1. Node.jsのバージョン（18以上が必要）
2. npm install が正常に完了しているか
3. .env.local ファイルが存在するか
4. database.db ファイルが作成されているか

## 次のステップ

- アクセスリンクをカスタマイズ
- デザインを調整
- 管理画面の追加（オプション）
- メール通知機能の追加（オプション）
