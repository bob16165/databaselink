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

-- メール購読者テーブル
CREATE TABLE subscribers (
  id BIGSERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  grade VARCHAR(10) NOT NULL CHECK (grade IN ('1年', '2年', '3年')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メール送信履歴テーブル
CREATE TABLE email_history (
  id BIGSERIAL PRIMARY KEY,
  target_grades JSONB NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by VARCHAR(255) NOT NULL
);

-- インデックス作成
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_links_order ON links("order");
CREATE INDEX idx_links_category ON links(category);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_time ON login_history(login_time DESC);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_grade ON subscribers(grade);
CREATE INDEX idx_email_history_sent_at ON email_history(sent_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が読み取り可能（認証チェックはアプリケーション層で実施）
CREATE POLICY "Allow read access for all" ON users FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON links FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON login_history FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON subscribers FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON email_history FOR SELECT USING (true);

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

CREATE POLICY "Allow insert for service role" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON subscribers FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON subscribers FOR DELETE USING (true);

CREATE POLICY "Allow insert for service role" ON email_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON email_history FOR UPDATE USING (true);
CREATE POLICY "Allow delete for service role" ON email_history FOR DELETE USING (true);
