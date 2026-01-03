# Vercel環境変数設定ガイド

## 重要: Vercelデプロイ前に必ず環境変数を設定してください

Vercelダッシュボードで以下の環境変数を設定する必要があります。

### 設定手順

1. Vercelプロジェクトページにアクセス
2. 「Settings」タブをクリック
3. 左メニューから「Environment Variables」を選択
4. 以下の環境変数を追加

### 必須の環境変数

#### 1. JWT_SECRET
```
JWT_SECRET=your-secret-key-change-this-in-production-12345678901234567890
```
- 任意の長い文字列に変更することを推奨

#### 2. NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL=https://tportcllilcbcvsrmanz.supabase.co
```
- Supabase Project Settings > API > Project URL から取得

#### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwb3J0Y2xsaWxjYmN2c3JtYW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NzI1MzMsImV4cCI6MjA1MTM0ODUzM30.S26KGMBKKXGX4iyWFIh5eg_E3zOE33u
```
- Supabase Project Settings > API > Project API keys > anon public から取得

#### 4. SUPABASE_SERVICE_ROLE_KEY
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwb3J0Y2xsaWxjYmN2c3JtYW56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc3MjUzMywiZXhwIjoyMDUxMzQ4NTMzfQ.08e8it-RcMd5oFIPRJaUKA_9hEK-PO-
```
- Supabase Project Settings > API > Project API keys > service_role から取得
- ⚠️ **注意**: この鍵は秘密鍵です。絶対に公開しないでください

### 環境の選択

各環境変数を追加する際、以下を選択してください：
- ✅ Production
- ✅ Preview
- ✅ Development

### 設定後

1. 環境変数を保存
2. プロジェクトを再デプロイ（Deploymentsタブから「Redeploy」）

### トラブルシューティング

#### ビルドエラー: "Supabase環境変数が設定されていません"

原因: 環境変数が設定されていない

解決策:
1. Vercelダッシュボードで環境変数を確認
2. すべての必須環境変数が設定されているか確認
3. 環境変数を保存後、必ず再デプロイ

#### 環境変数が反映されない

- デプロイ後、古いビルドキャッシュが残っている可能性があります
- Deploymentsタブから最新のデプロイを選択し、「Redeploy」を実行
