import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getActiveSubscribers, updateLastEmailSent } from '@/lib/db';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getDailyRashifalPrompt } from '@/lib/prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min max for Vercel

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Group subscribers by rashi+lang to avoid duplicate Claude calls
function groupSubscribers(subscribers) {
  const groups = {};
  for (const sub of subscribers) {
    const key = `${sub.rashi}_${sub.lang || 'en'}`;
    if (!groups[key]) groups[key] = { rashi: sub.rashi, lang: sub.lang || 'en', subscribers: [] };
    groups[key].subscribers.push(sub);
  }
  return Object.values(groups);
}

function buildEmailHTML(rashifal, rashi, name, unsubscribeToken, lang) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const greeting = lang === 'hi' ? `नमस्ते ${name}` : lang === 'mr' ? `नमस्कार ${name}` : `Hello ${name}`;
  const yourRashifal = lang === 'hi' ? 'आपका आज का राशिफल' : lang === 'mr' ? 'तुमचं आजचं राशिभविष्य' : 'Your Daily Rashifal';
  const readMore = lang === 'hi' ? 'पूरा राशिफल पढ़ें' : lang === 'mr' ? 'संपूर्ण राशिभविष्य वाचा' : 'Read Full Rashifal';
  const unsubText = lang === 'hi' ? 'सदस्यता रद्द करें' : lang === 'mr' ? 'सदस्यता रद्द करा' : 'Unsubscribe';

  const rating = rashifal?.rating || '7/10';
  const general = rashifal?.general || rashifal?.predictions?.general || 'Check the full rashifal on our website.';
  const luckyNumber = rashifal?.luckyNumber || rashifal?.lucky?.number || '--';
  const luckyColor = rashifal?.luckyColor || rashifal?.lucky?.color || '--';
  const tip = rashifal?.tipOfDay || rashifal?.tip || '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060918;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">

  <!-- Header -->
  <div style="text-align:center;padding:24px 0 16px;">
    <h1 style="color:#e8bf4b;font-size:24px;margin:0 0 4px;">MyRashifal+</h1>
    <p style="color:#8a90a8;font-size:13px;margin:0;">${today}</p>
  </div>

  <!-- Greeting -->
  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:16px;">
    <p style="color:#eaedf3;font-size:15px;margin:0 0 4px;">${greeting},</p>
    <h2 style="color:#e8bf4b;font-size:20px;margin:0;">${rashi} — ${yourRashifal}</h2>
  </div>

  <!-- Rating -->
  <div style="text-align:center;padding:12px 0;">
    <span style="color:#e8bf4b;font-size:28px;font-weight:bold;">${rating}</span>
    <p style="color:#8a90a8;font-size:12px;margin:4px 0 0;">Today's Rating</p>
  </div>

  <!-- General Prediction -->
  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:16px;">
    <p style="color:#eaedf3;font-size:14px;line-height:1.7;margin:0;">${general}</p>
  </div>

  <!-- Lucky Info -->
  <div style="display:flex;gap:12px;margin-bottom:16px;">
    <div style="flex:1;background:rgba(201,149,26,0.06);border:1px solid rgba(201,149,26,0.12);border-radius:10px;padding:14px;text-align:center;">
      <p style="color:#8a90a8;font-size:11px;margin:0 0 4px;">Lucky Number</p>
      <p style="color:#e8bf4b;font-size:18px;font-weight:bold;margin:0;">${luckyNumber}</p>
    </div>
    <div style="flex:1;background:rgba(201,149,26,0.06);border:1px solid rgba(201,149,26,0.12);border-radius:10px;padding:14px;text-align:center;">
      <p style="color:#8a90a8;font-size:11px;margin:0 0 4px;">Lucky Color</p>
      <p style="color:#e8bf4b;font-size:14px;font-weight:bold;margin:0;">${luckyColor}</p>
    </div>
  </div>

  ${tip ? `
  <!-- Tip -->
  <div style="background:rgba(201,149,26,0.06);border-left:3px solid #c9951a;border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:16px;">
    <p style="color:#e8bf4b;font-size:12px;font-weight:bold;margin:0 0 4px;">Tip of the Day</p>
    <p style="color:#eaedf3;font-size:13px;line-height:1.6;margin:0;">${tip}</p>
  </div>` : ''}

  <!-- CTA -->
  <div style="text-align:center;padding:16px 0;">
    <a href="https://myrashifal.in/rashifal" style="display:inline-block;background:linear-gradient(135deg,#c9951a,#e8bf4b);color:#060918;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">${readMore}</a>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid rgba(255,255,255,0.04);padding-top:16px;margin-top:16px;text-align:center;">
    <p style="color:#8a90a8;font-size:11px;margin:0 0 8px;">MyRashifal+ — Vedic Astrology & Kundli</p>
    <a href="https://myrashifal.in/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:#8a90a8;font-size:11px;text-decoration:underline;">${unsubText}</a>
  </div>

</div>
</body>
</html>`;
}

// Email sender: use verified domain, or fallback to Resend's onboarding sender
function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <rashifal@myrashifal.in>';
}

export async function GET(request) {
  try {
    // Check required env vars first
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET is not set');
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    // Verify cron secret (Vercel automatically sends this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', sent: 0 });
    }

    const groups = groupSubscribers(subscribers);
    const today = new Date().toISOString().split('T')[0];
    let totalSent = 0;
    const errors = [];

    // Generate rashifal per rashi+lang group, then send emails
    for (const group of groups) {
      try {
        let rashifal;
        if (group.rashi === 'general') {
          // Subscribers without a rashi yet — send a motivational general tip
          rashifal = {
            rating: '7/10',
            general: group.lang === 'mr'
              ? 'आज सर्वांसाठी शुभ दिवस आहे. वैयक्तिक राशिभविष्य मिळवण्यासाठी MyRashifal+ वर कुंडली तयार करा.'
              : group.lang === 'hi'
              ? 'आज सभी के लिए शुभ दिन है। व्यक्तिगत राशिफल पाने के लिए MyRashifal+ पर कुंडली बनाएँ।'
              : 'Today is an auspicious day. Generate your Kundli on MyRashifal+ for personalized rashifal.',
            luckyNumber: Math.floor(Math.random() * 9) + 1,
            luckyColor: 'Gold',
            tip: group.lang === 'mr'
              ? 'सकारात्मक विचार ठेवा आणि आजचा दिवस उत्साहाने सुरू करा.'
              : group.lang === 'hi'
              ? 'सकारात्मक विचार रखें और आज का दिन उत्साह से शुरू करें।'
              : 'Stay positive and start your day with enthusiasm.',
          };
        } else {
          const { system, user } = getDailyRashifalPrompt(group.rashi, today, group.lang);
          const response = await callClaude(system, user, 1500, 'claude-haiku-4-5-20251001');
          rashifal = parseClaudeJSON(response);
        }

        const rashiLabel = group.rashi === 'general' ? 'MyRashifal+' : group.rashi;

        // Send to each subscriber in this group
        for (const sub of group.subscribers) {
          try {
            const html = buildEmailHTML(rashifal, rashiLabel, sub.name, sub.unsubscribeToken, group.lang);

            await getResend().emails.send({
              from: getFromEmail(),
              to: sub.email,
              subject: `${rashiLabel} — Daily Rashifal | ${today}`,
              html,
            });

            await updateLastEmailSent(sub.email);
            totalSent++;
          } catch (emailErr) {
            console.error(`Email send error for ${sub.email}:`, emailErr.message);
            errors.push({ email: sub.email, error: emailErr.message });
          }
        }
      } catch (groupErr) {
        console.error(`Group error for ${group.rashi}:`, groupErr.message);
        errors.push({ rashi: group.rashi, error: groupErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron daily-rashifal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
