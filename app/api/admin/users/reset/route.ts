import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function isAdmin(username: string): boolean {
  return username === 'admin';
}

// 年度更新（全ユーザー削除）
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload.username)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // admin以外の全ユーザーを削除
    const { error } = await supabase
      .from('users')
      .delete()
      .neq('username', 'admin');

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: '全ユーザーを削除しました（管理者は除く）'
    });
  } catch (error) {
    console.error('Reset users error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
