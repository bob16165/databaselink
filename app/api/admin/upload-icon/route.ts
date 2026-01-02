import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // フォームデータを取得
    const formData = await request.formData();
    const file = formData.get('icon') as File;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }

    // ファイル検証
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: '画像ファイル（PNG, JPG, GIF, SVG）のみアップロード可能です' }, { status: 400 });
    }

    // ファイルサイズ制限（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 });
    }

    // ファイル名を生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `icon-${timestamp}.${ext}`;

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/iconsディレクトリに保存
    const path = join(process.cwd(), 'public', 'icons', filename);
    await writeFile(path, buffer);

    // 公開URLを返す
    const iconUrl = `/icons/${filename}`;

    return NextResponse.json({ iconUrl }, { status: 200 });
  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
