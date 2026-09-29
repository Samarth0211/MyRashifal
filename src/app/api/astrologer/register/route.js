import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAstrologerProfile, getAstrologerProfile } from '@/lib/db';

function buildRegistrationEmail(name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
      <h1 style="color: #e8bf4b; font-size: 22px; margin: 0 0 16px; text-align: center;">MyRashifal+</h1>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px;">
        <h2 style="color: #e8bf4b; font-size: 18px; margin: 0 0 12px;">Registration Received</h2>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 12px;">
          Hello ${name},
        </p>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 12px;">
          Thank you for registering as an astrologer on MyRashifal+. Your application is now under review.
        </p>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 12px;">
          We will review your profile and notify you via email once a decision has been made. This typically takes 1-2 business days.
        </p>
        <div style="margin-top: 20px; padding: 14px 16px; background: rgba(201,149,26,0.06); border-left: 3px solid #c9951a; border-radius: 0 8px 8px 0;">
          <p style="color: #e8bf4b; font-size: 12px; font-weight: bold; margin: 0 0 4px;">What&rsquo;s next?</p>
          <p style="color: #eaedf3; font-size: 13px; margin: 0;">Our team will verify your credentials and experience. You&rsquo;ll receive an email when your profile is approved.</p>
        </div>
      </div>
      <p style="margin-top: 20px; font-size: 11px; color: #8a90a8; text-align: center;">
        MyRashifal+ &mdash; Vedic Astrology &amp; Kundli &mdash; <a href="https://myrashifal.in" style="color: #8a90a8;">myrashifal.in</a>
      </p>
    </div>
  `;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    // Check if already registered
    const existing = await getAstrologerProfile(session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'You are already registered as an astrologer', status: existing.status },
        { status: 409 }
      );
    }

    const { name, phone, specializations, experience, languages, bio, pricePerSession, phoneVerified } = await request.json();

    if (!name || !phone || !specializations?.length || !experience || !pricePerSession) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    if (!phoneVerified) {
      return NextResponse.json({ error: 'Phone must be verified before registration' }, { status: 400 });
    }

    if (pricePerSession < 10 || pricePerSession > 10000) {
      return NextResponse.json({ error: 'Price must be between 10 and 10,000 INR' }, { status: 400 });
    }

    await createAstrologerProfile(session.user.id, {
      name,
      email: session.user.email,
      phone,
      phoneVerified: true,
      specializations,
      experience: Number(experience),
      languages: languages || ['en'],
      bio: bio || '',
      pricePerSession: Number(pricePerSession),
    });

    // Send confirmation email (fire-and-forget)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <onboarding@resend.dev>';

        resend.emails.send({
          from: fromEmail,
          to: session.user.email,
          subject: 'MyRashifal+ — Registration Received',
          html: buildRegistrationEmail(name),
        }).catch((err) => console.error('Registration email failed:', err.message));
      } catch (emailErr) {
        console.error('Resend init failed:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Registration submitted for approval' });
  } catch (error) {
    console.error('Astrologer register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
