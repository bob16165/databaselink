import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseKey
      });
      return NextResponse.json({ 
        error: 'サーバー設定エラー: Supabase環境変数が設定されていません' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('icons')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', {
        message: error.message,
        error: error
      });
      return NextResponse.json({ 
        error: `アップロードに失敗しました: ${error.message}` 
      }, { status: 500 });
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('icons')
      .getPublicUrl(filename);

    return NextResponse.json({ iconUrl: urlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Icon upload error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({ 
      error: `アップロードに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` 
    }, { status: 500 });
  }
}
