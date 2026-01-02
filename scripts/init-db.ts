import { initDatabase } from '../lib/db';
import { createUser, createArticle } from '../lib/models';
import { createLink } from '../lib/links';

console.log('データベースを初期化しています...');
initDatabase();

console.log('\nサンプルユーザーを作成しています...');
try {
  // 管理者アカウント
  createUser('admin', 'admin123', '管理者');
  
  // サンプルユーザーの作成（後で実際のデータに置き換えてください）
  createUser('parent001', 'password123', '山田太郎');
  createUser('parent002', 'password123', '佐藤花子');
  createUser('parent003', 'password123', '鈴木一郎');
  console.log('✓ サンプルユーザーを作成しました');
} catch (error) {
  console.log('エラー:', error);
}

console.log('\nサンプル記事を作成しています...');
try {
  createArticle(
    '保護者会のお知らせ',
    '2026年1月15日（木）に保護者会を開催いたします。\n詳細は後日お知らせいたします。',
    '学校事務局'
  );
  
  createArticle(
    '冬期休暇のお知らせ',
    '12月25日から1月7日まで冬期休暇となります。\n緊急時の連絡先は学校ウェブサイトをご確認ください。',
    '教務課'
  );
  
  createArticle(
    'オンラインポータル開設のお知らせ',
    '保護者向けオンラインポータルを開設いたしました。\nログインIDとパスワードは別途郵送にてお送りしております。',
    '学校事務局'
  );
  
  console.log('✓ サンプル記事を作成しました');
} catch (error) {
  console.log('エラー:', error);
}

console.log('\nサンプルアクセスリンクを作成しています...');
try {
  createLink('学生情報', '成績や出席状況を確認', '#', 'card');
  createLink('学校カレンダー', '行事予定を確認', '#', 'card');
  createLink('お問い合わせ', '学校への連絡', '#', 'card');
  console.log('✓ サンプルアクセスリンクを作成しました');
} catch (error) {
  console.log('エラー:', error);
}

console.log('\n初期化が完了しました！');
console.log('\n管理者ログイン情報:');
console.log('ユーザー名: admin');
console.log('パスワード: admin123');
console.log('\nサンプルログイン情報:');
console.log('ユーザー名: parent001');
console.log('パスワード: password123');
