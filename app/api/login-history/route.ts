import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getLoginHistory } from '@/lib/models-supabase';

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
    const limit = parseInt(searchParams.get('limit') || '10');

    // 自分のログイン履歴を取得
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
