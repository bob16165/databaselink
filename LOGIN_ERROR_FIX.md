# ログインエラーの解決方法

## 問題
「ログイン中にエラーが発生しました」というエラーが表示される

## 原因
Supabase APIキーが不完全または無効です。

## 解決手順

### 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard にアクセスしてログイン

### 2. プロジェクトを選択
`tportcllilcbcvsrmanz` プロジェクトを選択

### 3. APIキーを取得
左メニュー「Settings」→「API」を開く

以下の2つのキーをコピー：
- **Project URL**: `https://tportcllilcbcvsrmanz.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (長いJWTトークン)
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (長いJWTトークン)

⚠️ **重要**: トークンは非常に長い文字列です（200文字以上）。全体をコピーしてください。

### 4. `.env.local` を更新

プロジェクトフォルダの `.env.local` ファイルを開き、以下のように更新：

```env
JWT_SECRET=your-secret-key-change-this-in-production-12345678901234567890
DATABASE_PATH=./database.json

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://tportcllilcbcvsrmanz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ここに完全なanon public keyを貼り付け>
SUPABASE_SERVICE_ROLE_KEY=<ここに完全なservice_role keyを貼り付け>
```

### 5. 開発サーバーを再起動

```bash
# 現在のサーバーを停止 (Ctrl+C)
# 再起動
npm run dev
```

### 6. データベースを初期化（初回のみ）

```bash
npx tsx scripts/init-supabase.ts
```

これで管理者ユーザー（admin / admin123）が作成されます。

### 7. ログインを試す

ブラウザで http://localhost:3000 にアクセスし、以下でログイン：
- ユーザー名: `admin`
- パスワード: `admin123`

## トラブルシューティング

### それでもログインできない場合

1. ブラウザのコンソール（F12）でエラーを確認
2. ターミナルでサーバーのエラーログを確認
3. Supabaseダッシュボードで「Table Editor」→「users」テーブルを確認し、adminユーザーが存在するか確認
