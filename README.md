# 保護者ポータル

学生の保護者向けアクセスリンクホームページです。

## 機能

- ✅ ログインID・パスワード認証
- ✅ 白背景の清潔感あるデザイン
- ✅ お知らせ・更新情報の表示
- ✅ ログイン履歴の確認
- ✅ アクセスリンク集
- ✅ セキュアなセッション管理

## 必要な環境

- Node.js 18以上
- npm または yarn

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. データベースの初期化:
```bash
npm run init-db
```

3. 開発サーバーの起動:
```bash
npm run dev
```

4. ブラウザで http://localhost:3000 にアクセス

## サンプルログイン情報

初期化後、以下の情報でログインできます：

- ユーザー名: `parent001`
- パスワード: `password123`

## データベース構造

### ユーザーテーブル (users)
- id: ユーザーID
- username: ログインID
- password: ハッシュ化パスワード
- full_name: 氏名
- created_at: 作成日時

### 記事テーブル (articles)
- id: 記事ID
- title: タイトル
- content: 内容
- author: 投稿者
- created_at: 作成日時
- updated_at: 更新日時

### ログイン履歴テーブル (login_history)
- id: 履歴ID
- user_id: ユーザーID
- username: ユーザー名
- login_time: ログイン時刻
- ip_address: IPアドレス
- user_agent: ユーザーエージェント

## ユーザーデータの追加方法

実際のユーザーデータを追加する場合は、以下の方法があります：

### 1. スクリプトでの一括登録

`scripts/add-users.ts` を作成して一括登録:

```typescript
import { createUser } from './lib/models';

const users = [
  { username: 'parent001', password: 'pass1', fullName: '山田太郎' },
  { username: 'parent002', password: 'pass2', fullName: '佐藤花子' },
  // ... 他のユーザー
];

users.forEach(user => {
  createUser(user.username, user.password, user.fullName);
});
```

### 2. 管理画面の作成

管理者用の画面を作成してユーザーを管理することもできます。

## 環境変数

`.env.local` ファイルで以下を設定：

```
JWT_SECRET=your-secret-key-change-this-in-production
DATABASE_PATH=./database.db
```

本番環境では必ず `JWT_SECRET` を変更してください。

## セキュリティ

- パスワードは bcrypt でハッシュ化されています
- JWT トークンでセッション管理
- HttpOnly Cookie でトークンを保護
- CSRF 対策として SameSite Cookie を使用

## 本番環境へのデプロイ

1. 環境変数を設定
2. ビルド: `npm run build`
3. 起動: `npm start`

## カスタマイズ

- デザインの変更: `app/globals.css` と Tailwind CSS
- アクセスリンクの変更: `app/dashboard/page.tsx` のリンクセクション
- 記事の追加: データベースに直接追加、または管理画面を作成

## ライセンス

Private
