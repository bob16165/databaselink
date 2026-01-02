# Supabase移行ガイド

## 1. Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. 新しいプロジェクトを作成
   - Organization: 新規作成または既存を選択
   - Name: `parent-portal` (任意)
   - Database Password: 強力なパスワードを設定（保存しておく）
   - Region: `Northeast Asia (Tokyo)` を選択
4. プロジェクトが作成されるまで待機（1-2分）

## 2. データベーススキーマの作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/schema.sql` の内容をコピー
3. SQL Editorに貼り付けて「Run」を実行
4. テーブルが正常に作成されたことを確認

## 3. 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー:
   - Project URL
   - anon public key

3. `.env.local` ファイルを編集:
```bash
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

## 4. アプリケーションの起動

```bash
npm run dev
```

## 5. 初期データの投入

Supabaseダッシュボードで「SQL Editor」を使用して初期データを投入します。

### 管理者ユーザーの作成

```sql
-- パスワード: admin123 (bcryptハッシュ化済み)
INSERT INTO users (username, password, full_name)
VALUES ('admin', '$2a$10$u2g6dOT5o33450f3Y7rHdOdnKQ6uetpcQot8Il3yr1bnZq9KXo60u', '管理者');
```

### サンプル保護者ユーザーの作成

```sql
-- パスワード: password123
INSERT INTO users (username, password, full_name) VALUES
('parent001', '$2a$10$nhxRGCFkeULDB4hBpl6D2OkINvfKyrcf23vGVvO5JWNQBlamsewJK', '山田太郎'),
('parent002', '$2a$10$2/4WxF.BE.jD1lEjJaZT3edGYJBdoFDu9kWIVh/1AHkD8ivymAEsC', '佐藤花子'),
('parent003', '$2a$10$2ROhN1QM3D/cFUivGrH9cexpau8Tsr5LTInxhob3eL8IKvoV45/Eq', '鈴木一郎');
```

### サンプル記事の作成

```sql
INSERT INTO articles (title, content, author) VALUES
('保護者会のお知らせ', '2026年1月15日（木）に保護者会を開催いたします。
詳細は後日お知らせいたします。', '学校事務局'),
('冬期休暇のお知らせ', '12月25日から1月7日まで冬期休暇となります。
緊急時の連絡先は学校ウェブサイトをご確認ください。', '教務課'),
('オンラインポータル開設のお知らせ', '保護者向けオンラインポータルを開設いたしました。
ログインIDとパスワードは別途郵送にてお送りしております。', '学校事務局');
```

### サンプルリンクの作成

```sql
INSERT INTO links (title, description, url, "order", display_type, category) VALUES
('学生情報', '成績や出席状況を確認', '#', 0, 'card', '共通'),
('学校カレンダー', '行事予定を確認', '#', 1, 'card', '共通'),
('お問い合わせ', '学校への連絡', '#', 2, 'card', '共通');
```

## 6. 動作確認

1. http://localhost:3000 にアクセス
2. `admin` / `admin123` でログイン
3. 管理画面でデータが表示されることを確認

## トラブルシューティング

### 接続エラーが発生する場合

- `.env.local` のURLとキーが正しいか確認
- Supabaseプロジェクトが起動しているか確認
- ブラウザのコンソールでエラーメッセージを確認

### RLSポリシーエラーが発生する場合

- `schema.sql` のRLSポリシーが正しく適用されているか確認
- 必要に応じてSupabaseダッシュボードで「Authentication」→「Policies」を確認
