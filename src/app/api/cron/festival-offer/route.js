import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getActiveSubscribers, updateLastEmailSent } from '@/lib/db';
import { getUpcomingFestival, getTodayFestival, getFestivalName } from '@/lib/festivals';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <rashifal@myrashifal.in>';
}

function buildFestivalEmailHTML(festival, lang, name, unsubscribeToken, isToday) {
  const festivalName = getFestivalName(festival, lang);
  const discount = festival.discount;

  const greeting = lang === 'mr' ? `नमस्कार ${name}`
    : lang === 'hi' ? `नमस्ते ${name}`
    : `Hello ${name}`;

  const headline = isToday
    ? (lang === 'mr' ? `${festivalName}च्या हार्दिक शुभेच्छा!`
      : lang === 'hi' ? `${festivalName} की हार्दिक शुभकामनाएँ!`
      : `Happy ${festivalName}!`)
    : (lang === 'mr' ? `${festivalName} विशेष संधी!`
      : lang === 'hi' ? `${festivalName} विशेष अवसर!`
      : `${festivalName} Special Offer!`);

  const offerText = lang === 'mr'
    ? `सर्व ज्योतिष फलादेश अहवालांवर ${discount}% सूट मिळवा. ही संधी मर्यादित कालावधीसाठी आहे!`
    : lang === 'hi'
    ? `सभी ज्योतिष फलादेश अहवालों पर ${discount}% छूट पाएँ। यह अवसर सीमित समय के लिए है!`
    : `Get ${discount}% off on all astrology reports. This offer is for a limited time only!`;

  const cta = lang === 'mr' ? 'फलादेश अहवाल पहा'
    : lang === 'hi' ? 'फलादेश अहवाल देखें'
    : 'View Reports';

  const unsubText = lang === 'mr' ? 'सदस्यता रद्द करा'
    : lang === 'hi' ? 'सदस्यता रद्द करें'
    : 'Unsubscribe';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060918;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">

  <div style="text-align:center;padding:24px 0 16px;">
    <h1 style="color:#e8bf4b;font-size:24px;margin:0 0 4px;">MyRashifal+</h1>
  </div>

  <div style="background:linear-gradient(135deg,rgba(201,149,26,0.15),rgba(201,149,26,0.05));border:1px solid rgba(232,191,75,0.3);border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:16px;">
    <p style="color:#eaedf3;font-size:15px;margin:0 0 8px;">${greeting},</p>
    <h2 style="color:#e8bf4b;font-size:26px;margin:0 0 8px;">✨ ${headline}</h2>
    <p style="color:#eaedf3;font-size:14px;line-height:1.7;margin:0 0 16px;">${offerText}</p>
    <div style="background:rgba(232,191,75,0.1);border:2px dashed #e8bf4b;border-radius:12px;padding:16px;margin-bottom:16px;">
      <span style="color:#e8bf4b;font-size:36px;font-weight:bold;">${discount}% OFF</span>
      <p style="color:#8a90a8;font-size:12px;margin:6px 0 0;">All Reports</p>
    </div>
    <a href="https://myrashifal.in/reports" style="display:inline-block;background:linear-gradient(135deg,#c9951a,#e8bf4b);color:#060918;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;">${cta}</a>
  </div>

  <div style="border-top:1px solid rgba(255,255,255,0.04);padding-top:16px;margin-top:16px;text-align:center;">
    <p style="color:#8a90a8;font-size:11px;margin:0 0 8px;">MyRashifal+ — Vedic Astrology & Kundli</p>
    <a href="https://myrashifal.in/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:#8a90a8;font-size:11px;text-decoration:underline;">${unsubText}</a>
  </div>

</div>
</body>
</html>`;
}

export async function GET(request) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if there's an upcoming festival (2 days away) or today's festival
    const upcoming = getUpcomingFestival(2);
    const today = getTodayFestival();

    if (!upcoming && !today) {
      return NextResponse.json({ message: 'No festival offers to send', sent: 0 });
    }

    const festival = today || upcoming;
    const isToday = !!today;

    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', sent: 0 });
    }

    let totalSent = 0;
    const errors = [];
    const resend = getResend();
    const festivalNameEn = festival.name;

    for (const sub of subscribers) {
      try {
        const html = buildFestivalEmailHTML(festival, sub.lang || 'en', sub.name, sub.unsubscribeToken, isToday);
        const localName = getFestivalName(festival, sub.lang || 'en');

        await resend.emails.send({
          from: getFromEmail(),
          to: sub.email,
          subject: isToday
            ? `✨ Happy ${festivalNameEn}! ${festival.discount}% Off All Reports`
            : `🎉 ${festivalNameEn} Offer — ${festival.discount}% Off All Reports`,
          html,
        });

        totalSent++;
      } catch (err) {
        errors.push({ email: sub.email, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      festival: festivalNameEn,
      isToday,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Festival offer cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
