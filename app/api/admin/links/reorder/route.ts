import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { reorderLinks } from '@/lib/links-supabase';

export async function PUT(request: NextRequest) {
  try {
    // 認証確認
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.username !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // リクエストボディからリンクIDの配列を取得
    const { linkIds } = await request.json();

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: 'linkIdsは配列である必要があります' }, { status: 400 });
    }

    // リンクの順序を更新
    await reorderLinks(linkIds);

    return NextResponse.json({ message: '並び順を更新しました' }, { status: 200 });
  } catch (error) {
    console.error('Reorder links error:', error);
    return NextResponse.json({ error: '並び順の更新に失敗しました' }, { status: 500 });
  }
}
