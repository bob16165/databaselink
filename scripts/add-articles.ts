import { createArticle } from '../lib/models';

/**
 * 記事一括登録スクリプト
 * 
 * 使用方法:
 * 1. 下のarticlesDataに記事情報を入力
 * 2. npx tsx scripts/add-articles.ts を実行
 */

const articlesData = [
  {
    title: '保護者会のお知らせ',
    content: `2026年1月15日（木）14:00より保護者会を開催いたします。

場所: 学校体育館
内容: 新年度の予定について
持ち物: 上履き、筆記用具

ご参加をお待ちしております。`,
    author: '学校事務局'
  },
  {
    title: '成績表の配布について',
    content: `学期末の成績表は1月20日に配布予定です。
ご確認の上、ご質問等ございましたら担任までお問い合わせください。`,
    author: '教務課'
  },
  
  // ここに追加の記事を記入してください
  // {
  //   title: 'タイトル',
  //   content: '記事の内容',
  //   author: '投稿者名'
  // },
];

async function main() {
  console.log('記事の一括登録を開始します...\n');

  let successCount = 0;

  for (let index = 0; index < articlesData.length; index++) {
    const article = articlesData[index];
    try {
      await createArticle(article.title, article.content, article.author);
      console.log(`✓ [${index + 1}/${articlesData.length}] "${article.title}" を登録しました`);
      successCount++;
    } catch (error) {
      console.log(`✗ [${index + 1}/${articlesData.length}] "${article.title}" の登録に失敗しました`);
    }
  }

  console.log(`\n登録完了: ${successCount}/${articlesData.length}件`);
  process.exit(0);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
