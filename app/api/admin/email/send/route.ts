import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.username !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { targetGrades } = await request.json();

    if (!targetGrades || targetGrades.length === 0) {
      return NextResponse.json({ error: '送信対象を選択してください' }, { status: 400 });
    }

    // 対象の購読者を取得
    let query = supabase.from('subscribers').select('email');
    
    if (!targetGrades.includes('全学年')) {
      query = query.in('grade', targetGrades);
    }

    const { data: subscribers, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: '送信対象が見つかりません' }, { status: 404 });
    }

    const emailAddresses = subscribers.map(s => s.email);
    const testEmail = process.env.RESEND_TEST_EMAIL;
    const finalRecipients = testEmail ? [testEmail] : emailAddresses;

    // メール送信
    const { data: emailData, error: sendError } = await resend.emails.send({
      from: 'ポータルサイト <onboarding@resend.dev>', // 注: 本番環境では独自ドメインに変更
      to: finalRecipients,
      subject: 'ポータルサイトが更新されました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p>保護者の皆様</p>
          <p>ポータルサイトが更新されました。</p>
          <p style="margin: 20px 0;">↓ポータルサイトログインURL↓</p>
          <p><a href="https://databaselink.vercel.app" style="color: #0066cc; font-weight: bold;">https://databaselink.vercel.app</a></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">※このメールに心当たりがない場合は、学校までお問い合わせください。</p>
          <p style="font-size: 12px; color: #666;">※こちらのアドレスは送信専用です。</p>
        </div>
      `,
    });

    if (sendError) {
      console.error('Email send error:', sendError);
      return NextResponse.json(
        {
          error: 'メール送信に失敗しました',
          details: sendError?.message || String(sendError)
        },
        { status: 500 }
      );
    }

    // 送信履歴を保存
    const { error: historyError } = await supabase
      .from('email_history')
      .insert({
        target_grades: targetGrades,
        recipient_count: finalRecipients.length,
        sent_by: decoded.username
      });

    if (historyError) {
      console.error('History save error:', historyError);
    }

    return NextResponse.json({
      success: true,
      recipientCount: finalRecipients.length,
      emailId: emailData?.id
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 });
  }
}
