import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.username !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get email history error:', error);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}
