import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// .env.local を読み込む
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initSupabase() {
  console.log('Supabaseデータベースを初期化しています...');

  try {
    // 既存データをクリア
    console.log('\n既存データを削除しています...');
    await supabase.from('login_history').delete().neq('id', 0);
    await supabase.from('links').delete().neq('id', 0);
    await supabase.from('articles').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);
    console.log('✓ 既存データを削除しました');

    // ユーザー作成
    console.log('\nサンプルユーザーを作成しています...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const { error: usersError } = await supabase.from('users').insert([
      { username: 'admin', password: adminPassword, full_name: '管理者' },
      { username: 'parent001', password: userPassword, full_name: '山田太郎' },
      { username: 'parent002', password: userPassword, full_name: '佐藤花子' },
      { username: 'parent003', password: userPassword, full_name: '鈴木一郎' },
    ]);

    if (usersError) throw usersError;
    console.log('✓ サンプルユーザーを作成しました');

    // 記事作成
    console.log('\nサンプル記事を作成しています...');
    const { error: articlesError } = await supabase.from('articles').insert([
      {
        title: '保護者会のお知らせ',
        content: '2026年1月15日（木）に保護者会を開催いたします。\n詳細は後日お知らせいたします。',
        author: '学校事務局',
      },
      {
        title: '冬期休暇のお知らせ',
        content: '12月25日から1月7日まで冬期休暇となります。\n緊急時の連絡先は学校ウェブサイトをご確認ください。',
        author: '教務課',
      },
      {
        title: 'オンラインポータル開設のお知らせ',
        content: '保護者向けオンラインポータルを開設いたしました。\nログインIDとパスワードは別途郵送にてお送りしております。',
        author: '学校事務局',
      },
    ]);

    if (articlesError) throw articlesError;
    console.log('✓ サンプル記事を作成しました');

    // リンク作成
    console.log('\nサンプルアクセスリンクを作成しています...');
    const { error: linksError } = await supabase.from('links').insert([
      {
        title: '学生情報',
        description: '成績や出席状況を確認',
        url: '#',
        order: 0,
        display_type: 'card',
        category: '共通',
      },
      {
        title: '学校カレンダー',
        description: '行事予定を確認',
        url: '#',
        order: 1,
        display_type: 'card',
        category: '共通',
      },
      {
        title: 'お問い合わせ',
        description: '学校への連絡',
        url: '#',
        order: 2,
        display_type: 'card',
        category: '共通',
      },
    ]);

    if (linksError) throw linksError;
    console.log('✓ サンプルアクセスリンクを作成しました');

    console.log('\n初期化が完了しました！');
    console.log('\n管理者ログイン情報:');
    console.log('ユーザー名: admin');
    console.log('パスワード: admin123');
    console.log('\nサンプルログイン情報:');
    console.log('ユーザー名: parent001');
    console.log('パスワード: password123');
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

initSupabase();
