import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createArticle, getAllArticles, deleteArticle } from '@/lib/models-supabase';

// 管理者チェック
function isAdmin(username: string): boolean {
  return username === 'admin';
}

// 記事一覧取得
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

    const articles = await getAllArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Articles fetch error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// 記事追加
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
    const { title, content, author, documents } = body;

    if (!title || !content || !author) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    await createArticle(title, content, author, documents || []);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Article create error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// 記事削除
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

    await deleteArticle(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
