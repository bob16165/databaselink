-- 保護者ポータルシステム用Supabaseスキーマ

-- ユーザーテーブル
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクセスリンクテーブル
CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  icon_url TEXT,
  display_type VARCHAR(50) DEFAULT 'card' CHECK (display_type IN ('card', 'icon')),
  category VARCHAR(100) DEFAULT '共通',
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ログイン履歴テーブル
CREATE TABLE login_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(100),
  user_agent TEXT
);

-- インデックス作成
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_links_order ON links("order");
CREATE INDEX idx_links_category ON links(category);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_time ON login_history(login_time DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が読み取り可能（認証チェックはアプリケーション層で実施）
CREATE POLICY "Allow read access for all" ON users FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON links FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON login_history FOR SELECT USING (true);

-- RLSポリシー: サービスロールのみ書き込み可能
CREATE POLICY "Allow insert for service role" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON users FOR DELETE USING (true);

CREATE POLICY "Allow insert for service role" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON articles FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON articles FOR DELETE USING (true);

CREATE POLICY "Allow insert for service role" ON links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON links FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON links FOR DELETE USING (true);

CREATE POLICY "Allow insert for service role" ON login_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON login_history FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON login_history FOR DELETE USING (true);
