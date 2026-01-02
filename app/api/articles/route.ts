import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllArticles } from '@/lib/models-supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const articles = await getAllArticles();

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Articles fetch error:', error);
    return NextResponse.json(
      { error: '記事の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
