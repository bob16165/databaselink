import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createUser } from '@/lib/models-supabase';

function isAdmin(username: string): boolean {
  return username === 'admin';
}

// CSV一括ユーザー登録
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload.username)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('csv') as File;

    if (!file) {
      return NextResponse.json({ error: 'CSVファイルが必要です' }, { status: 400 });
    }

    // CSVファイルを読み込み
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    // ヘッダー行をスキップ（オプション）
    const dataLines = lines[0].includes('学籍番号') || lines[0].includes('ID') 
      ? lines.slice(1) 
      : lines;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length < 3) {
        results.failed++;
        results.errors.push(`行${i + 1}: データが不足しています（3列必要）`);
        continue;
      }

      const [studentId, fullName, password] = columns;

      if (!studentId || !fullName || !password) {
        results.failed++;
        results.errors.push(`行${i + 1}: 空の値があります`);
        continue;
      }

      try {
        await createUser(studentId, password, fullName);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`行${i + 1} (${studentId}): ${error.message || '登録失敗'}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `成功: ${results.success}件、失敗: ${results.failed}件`,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
