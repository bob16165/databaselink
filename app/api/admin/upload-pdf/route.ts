import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return NextResponse.json({ pdfUrl: urlData.publicUrl, fileName: originalName });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
