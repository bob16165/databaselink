import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { studentName, email, grade } = await request.json();

    if (!studentName || !email || !grade) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    // 学年チェック
    if (!['1年', '2年', '3年'].includes(grade)) {
      return NextResponse.json({ error: '学年を選択してください' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        student_name: studentName,
        email,
        grade
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Subscriber registration error:', error);
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
  }
}
