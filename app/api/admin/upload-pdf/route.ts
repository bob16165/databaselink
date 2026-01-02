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

    const payload = verifyToken(token);
    if (!payload || payload.username !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: 'PDFファイルが必要です' }, { status: 400 });
    }

    // ファイルサイズチェック（20MB制限）
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは20MB以下にしてください' }, { status: 400 });
    }

    // PDFファイルかチェック
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDFファイルのみアップロード可能です' }, { status: 400 });
    }

    // ファイル名を安全な形式に変換
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = join(process.cwd(), 'public', 'documents', fileName);
    await writeFile(path, buffer);

    const pdfUrl = `/documents/${fileName}`;

    return NextResponse.json({ pdfUrl, fileName: originalName });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
