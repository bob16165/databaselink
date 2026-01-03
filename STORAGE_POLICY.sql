-- Supabase Storage ポリシー設定
-- https://supabase.com/dashboard/project/tportcllilcbcvsrmanz/sql/new で実行してください

-- 既存のポリシーを削除（エラーが出ても問題ありません）
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;

-- documentsバケットへのアップロード許可（認証済みユーザー）
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- documentsバケットの読み取り許可（全員）
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- iconsバケットへのアップロード許可（認証済みユーザー）
CREATE POLICY "Allow authenticated icon uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'icons');

-- iconsバケットの読み取り許可（全員）
CREATE POLICY "Allow public icon reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'icons');
