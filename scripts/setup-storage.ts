import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Supabase Storage バケット作成開始...\n');

  try {
    // アイコン用バケット作成
    console.log('📁 icons バケット作成中...');
    const { data: iconsData, error: iconsError } = await supabase.storage.createBucket('icons', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml']
    });

    if (iconsError) {
      if (iconsError.message.includes('already exists')) {
        console.log('✓ icons バケットは既に存在します');
      } else {
        console.error('❌ icons バケット作成エラー:', iconsError);
      }
    } else {
      console.log('✅ icons バケット作成完了');
    }

    // ドキュメント用バケット作成
    console.log('📁 documents バケット作成中...');
    const { data: docsData, error: docsError } = await supabase.storage.createBucket('documents', {
      public: true,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: ['application/pdf']
    });

    if (docsError) {
      if (docsError.message.includes('already exists')) {
        console.log('✓ documents バケットは既に存在します');
      } else {
        console.error('❌ documents バケット作成エラー:', docsError);
      }
    } else {
      console.log('✅ documents バケット作成完了');
    }

    // バケット一覧確認
    console.log('\n📋 作成されたバケット一覧:');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ バケット一覧取得エラー:', listError);
    } else {
      buckets?.forEach(bucket => {
        console.log(`  - ${bucket.name} (public: ${bucket.public})`);
      });
    }

    console.log('\n✅ Supabase Storage セットアップ完了!');
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

setupStorage();
