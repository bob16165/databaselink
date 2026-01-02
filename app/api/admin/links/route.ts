import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createLink, getAllLinks, updateLink, deleteLink } from '@/lib/links-supabase';

function isAdmin(username: string): boolean {
  return username === 'admin';
}

// リンク一覧取得
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

// リンク追加
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
    const { title, description, url, displayType, iconUrl, category, documents } = body;

    if (!title || !description || !url) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    await createLink(title, description, url, displayType || 'card', iconUrl, category || '共通', documents || []);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link create error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// リンク更新
export async function PUT(request: NextRequest) {
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
    const { id, title, description, url, displayType, iconUrl, category, documents } = body;

    if (!id || !title || !description || !url) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    await updateLink(id, title, description, url, displayType, iconUrl, category, documents);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link update error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}

// リンク削除
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

    await deleteLink(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link delete error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
