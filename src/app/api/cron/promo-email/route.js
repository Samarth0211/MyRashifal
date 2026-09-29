import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getActiveSubscribers, getCronState, setCronState } from '@/lib/db';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getPromoEmailPrompt } from '@/lib/prompts';
import { PRICING } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <rashifal@myrashifal.in>';
}

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// Report types to rotate through for promos
const PROMO_TYPES = ['career', 'marriage', 'health', 'varshphal', 'education', 'gemstone', 'child', 'sadesati', 'numerology'];

function buildPromoEmailHTML(tip, cta, reportName, reportIcon, price, lang, name, unsubscribeToken) {
  const greeting = lang === 'mr' ? `नमस्कार ${name}`
    : lang === 'hi' ? `नमस्ते ${name}`
    : `Hello ${name}`;

  const tipLabel = lang === 'mr' ? 'ज्योतिष सल्ला'
    : lang === 'hi' ? 'ज्योतिष सुझाव'
    : 'Astrology Tip';

  const ctaBtn = lang === 'mr' ? 'तुमचा अहवाल मिळवा'
    : lang === 'hi' ? 'अपना अहवाल पाएँ'
    : 'Get Your Report';

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

  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:16px;">
    <p style="color:#eaedf3;font-size:15px;margin:0 0 4px;">${greeting},</p>
  </div>

  <!-- Astrology Tip -->
  <div style="background:rgba(201,149,26,0.06);border-left:3px solid #c9951a;border-radius:0 10px 10px 0;padding:16px 18px;margin-bottom:16px;">
    <p style="color:#e8bf4b;font-size:12px;font-weight:bold;margin:0 0 6px;">✦ ${tipLabel}</p>
    <p style="color:#eaedf3;font-size:14px;line-height:1.7;margin:0;">${tip}</p>
  </div>

  <!-- Report CTA -->
  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(232,191,75,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:16px;">
    <span style="font-size:36px;display:block;margin-bottom:8px;">${reportIcon}</span>
    <h3 style="color:#e8bf4b;font-size:18px;margin:0 0 6px;">${reportName}</h3>
    <p style="color:#eaedf3;font-size:13px;line-height:1.6;margin:0 0 12px;">${cta}</p>
    <p style="color:#8a90a8;font-size:12px;margin:0 0 12px;">Starting at ₹${price}</p>
    <a href="https://myrashifal.in/reports" style="display:inline-block;background:linear-gradient(135deg,#c9951a,#e8bf4b);color:#060918;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">${ctaBtn}</a>
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

    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', sent: 0 });
    }

    // Rotate report type
    const lastIndex = (await getCronState('promoReportIndex')) || 0;
    const nextIndex = (lastIndex + 1) % PROMO_TYPES.length;
    const reportType = PROMO_TYPES[nextIndex];
    const reportInfo = PRICING[reportType];
    await setCronState('promoReportIndex', nextIndex);

    // Group subscribers by lang
    const langGroups = {};
    for (const sub of subscribers) {
      const lang = sub.lang || 'en';
      if (!langGroups[lang]) langGroups[lang] = [];
      langGroups[lang].push(sub);
    }

    let totalSent = 0;
    const errors = [];
    const resend = getResend();

    for (const [lang, subs] of Object.entries(langGroups)) {
      try {
        // Generate AI tip for this lang
        const { system, user } = getPromoEmailPrompt(reportType, reportInfo.name, lang);
        const response = await callClaude(system, user, 500, HAIKU_MODEL);
        const { tip, cta } = parseClaudeJSON(response);

        // Send to each subscriber
        for (const sub of subs) {
          try {
            const html = buildPromoEmailHTML(
              tip, cta, reportInfo.name, reportInfo.icon, reportInfo.price,
              lang, sub.name, sub.unsubscribeToken
            );

            await resend.emails.send({
              from: getFromEmail(),
              to: sub.email,
              subject: `✦ ${reportInfo.icon} ${reportInfo.name} — MyRashifal+`,
              html,
            });

            totalSent++;
          } catch (emailErr) {
            errors.push({ email: sub.email, error: emailErr.message });
          }
        }
      } catch (groupErr) {
        console.error(`Promo group error for lang ${lang}:`, groupErr.message);
        errors.push({ lang, error: groupErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      reportType,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Promo email cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
