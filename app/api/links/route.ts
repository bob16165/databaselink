import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllLinks } from '@/lib/links-supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const links = await getAllLinks();
    
    // スネークケースからキャメルケースに変換
    const formattedLinks = links.map(link => ({
      ...link,
      displayType: link.display_type,
      iconUrl: link.icon_url,
    }));
    
    return NextResponse.json({ links: formattedLinks });
  } catch (error) {
    console.error('Links fetch error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
