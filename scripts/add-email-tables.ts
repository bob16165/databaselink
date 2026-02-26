import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addEmailTables() {
  console.log('🚀 メール機能用テーブル作成開始...\n');

  const sql = fs.readFileSync('/tmp/add_email_tables.sql', 'utf8');
  
  try {
    // Supabase SQL Editor経由で実行する必要があるため、手動実行の指示を表示
    console.log('📝 以下のSQLをSupabase SQL Editorで実行してください:');
    console.log('   https://supabase.com/dashboard/project/tportcllilcbcvsrmanz/sql/new\n');
    console.log(sql);
    console.log('\n✅ SQL実行後、Enterキーを押してください...');
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

addEmailTables();
