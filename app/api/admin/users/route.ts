import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createUser, getAllUsers, deleteUser, getUserByUsername } from '@/lib/models-supabase';

// 管理者チェック
function isAdmin(username: string): boolean {
  return username === 'admin';
}

// ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload.username)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const users = await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// ユーザー追加
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

    const body = await request.json();
    const { username, password, fullName } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    // 重複チェック
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'このユーザー名は既に使用されています' }, { status: 400 });
    }

    await createUser(username, password, fullName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// ユーザー削除
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const users = await getAllUsers();
    const user = users.find(u => u.id === parseInt(id));
    
    if (user?.username === 'admin') {
      return NextResponse.json({ error: '管理者アカウントは削除できません' }, { status: 400 });
    }

    await deleteUser(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
