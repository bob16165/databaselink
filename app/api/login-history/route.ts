import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getLoginHistory, getAllLoginHistory, getUserByUsername } from '@/lib/models-supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const all = searchParams.get('all') === 'true';

    // 管理者の場合は全ログイン履歴を取得
    if (all) {
      const user = await getUserByUsername(payload.username);
      if (!user || user.username !== 'admin') {
        return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
      }
      
      const history = await getAllLoginHistory(limit);
      return NextResponse.json({ history });
    }

    // 一般ユーザーは自分のログイン履歴のみ
    const history = await getLoginHistory(payload.userId, limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Login history fetch error:', error);
    return NextResponse.json(
      { error: 'ログイン履歴の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
