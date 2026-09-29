import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveOtp } from '@/lib/db';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildOtpEmail(name, otp) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
      <h1 style="color: #e8bf4b; font-size: 22px; margin: 0 0 16px; text-align: center;">MyRashifal+</h1>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #e8bf4b; font-size: 18px; margin: 0 0 12px;">Verification Code</h2>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
          Hello${name ? ` ${name}` : ''}, use this code to verify your astrologer registration:
        </p>
        <div style="background: rgba(232,191,75,0.1); border: 2px dashed #e8bf4b; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 200px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e8bf4b;">${otp}</span>
        </div>
        <p style="color: #8a90a8; font-size: 12px; margin: 16px 0 0;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
      <p style="margin-top: 20px; font-size: 11px; color: #8a90a8; text-align: center;">
        MyRashifal+ &mdash; Vedic Astrology &amp; Kundli &mdash; <a href="https://myrashifal.in" style="color: #8a90a8;">myrashifal.in</a>
      </p>
    </div>
  `;
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const email = session.user.email;
    const otp = generateOtp();

    // Store OTP in MongoDB with 5-minute expiry
    await saveOtp(session.user.id, email, otp);

    // Send OTP email via Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <noreply@myrashifal.in>';

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${otp} — MyRashifal+ Verification Code`,
      html: buildOtpEmail(session.user.name, otp),
    });

    // Return masked email for UI display
    const [localPart, domain] = email.split('@');
    const masked = localPart.slice(0, 2) + '***@' + domain;

    return NextResponse.json({ success: true, maskedEmail: masked });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
