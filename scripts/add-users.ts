import { createUser } from '../lib/models';

/**
 * ユーザー一括登録スクリプト
 * 
 * 使用方法:
 * 1. 下のusersDataに実際のユーザー情報を入力
 * 2. npx tsx scripts/add-users.ts を実行
 */

const usersData = [
  // サンプルデータ（実際のデータに置き換えてください）
  { username: 'parent001', password: 'password123', fullName: '山田太郎' },
  { username: 'parent002', password: 'password456', fullName: '佐藤花子' },
  { username: 'parent003', password: 'password789', fullName: '鈴木一郎' },
  
  // ここに追加のユーザーを記入してください
  // { username: 'ログインID', password: 'パスワード', fullName: '保護者氏名' },
];

async function main() {
  console.log('ユーザーの一括登録を開始します...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let index = 0; index < usersData.length; index++) {
    const userData = usersData[index];
    try {
      await createUser(userData.username, userData.password, userData.fullName);
      console.log(`✓ [${index + 1}/${usersData.length}] ${userData.fullName} (${userData.username}) を登録しました`);
      successCount++;
    } catch (error) {
      console.log(`✗ [${index + 1}/${usersData.length}] ${userData.username} の登録に失敗しました（既に存在する可能性があります）`);
      errorCount++;
    }
  }

  console.log('\n登録完了:');
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${errorCount}件`);
  process.exit(0);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
