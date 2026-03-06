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
    const limit = parseInt(searchParams.get('limit') || '500');
    const all = searchParams.get('all') === 'true';
    const startYear = searchParams.get('startYear');
    const startMonth = searchParams.get('startMonth');
    const endYear = searchParams.get('endYear');
    const endMonth = searchParams.get('endMonth');

    // 管理者の場合は全ログイン履歴を取得
    if (all) {
      const user = await getUserByUsername(payload.username);
      if (!user || user.username !== 'admin') {
        return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
      }
      
      let history = await getAllLoginHistory(limit);
      
      // 年月範囲でフィルタリング
      if (startYear && startMonth && endYear && endMonth) {
        const startYearNum = parseInt(startYear);
        const startMonthNum = parseInt(startMonth);
        const endYearNum = parseInt(endYear);
        const endMonthNum = parseInt(endMonth);
        
        history = history.filter(h => {
          const date = new Date(h.login_time);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          // 開始日付以降か確認
          const isAfterStart = year > startYearNum || (year === startYearNum && month >= startMonthNum);
          // 終了日付以前か確認
          const isBeforeEnd = year < endYearNum || (year === endYearNum && month <= endMonthNum);
          
          return isAfterStart && isBeforeEnd;
        });
      }
      
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
