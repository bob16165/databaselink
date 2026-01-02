# Vercelデプロイ手順

## 1. Vercelアカウント作成
https://vercel.com でGitHubアカウントでログイン

## 2. プロジェクトのインポート
1. Vercelダッシュボードで「Add New」→「Project」
2. GitHubリポジトリ `bob16165/databaselink` を選択
3. 「Import」をクリック

## 3. 環境変数の設定
以下の環境変数を設定:

```
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_SUPABASE_URL=https://tportcllilcbcvsrmanz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_S26KGMBKKXGX4iyWFIh5eg_E3zOE33u
SUPABASE_SERVICE_ROLE_KEY=sb_secret_08e8it-RcMd5oFIPRJaUKA_9hEK-PO-
```

## 4. デプロイ
「Deploy」ボタンをクリック

デプロイ完了後、Vercelが提供するURLでアクセス可能になります。
例: https://databaselink-xxxxx.vercel.app

## 5. カスタムドメイン設定（オプション）
Vercelダッシュボードで独自ドメインを設定可能

---

## ローカルからVercel CLIでデプロイする場合

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

## 注意事項
- Supabase Storageに移行済みのため、ファイルアップロードはクラウドに保存されます
- 初回デプロイ後、管理者アカウント(admin/admin123)でログイン可能
- データは全てSupabaseに保存されるため、Vercel環境間で共有されます
