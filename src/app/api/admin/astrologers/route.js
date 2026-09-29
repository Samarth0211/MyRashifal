import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingAstrologers, getAllAstrologers, updateAstrologerStatus, getAstrologerById } from '@/lib/db';

function isAdmin(session) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());
}

function buildStatusEmail(name, status) {
  const isApproved = status === 'approved';
  const heading = isApproved ? 'Profile Approved!' : 'Registration Update';
  const message = isApproved
    ? 'Congratulations! Your astrologer profile has been approved. You can now log in to your dashboard, set yourself online, and start receiving consultation requests from users.'
    : 'After reviewing your application, we are unable to approve your astrologer profile at this time. If you believe this is an error or would like to provide additional information, please contact us.';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
      <h1 style="color: #e8bf4b; font-size: 22px; margin: 0 0 16px; text-align: center;">MyRashifal+</h1>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px;">
        <h2 style="color: ${isApproved ? '#4ade80' : '#f87171'}; font-size: 18px; margin: 0 0 12px;">${heading}</h2>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 12px;">Hello ${name},</p>
        <p style="color: #eaedf3; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">${message}</p>
        ${isApproved ? `
          <div style="text-align: center; padding: 8px 0;">
            <a href="https://myrashifal.in/astrologer/dashboard" style="display: inline-block; background: linear-gradient(135deg, #c9951a, #e8bf4b); color: #060918; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px;">Go to Dashboard</a>
          </div>
        ` : ''}
      </div>
      <p style="margin-top: 20px; font-size: 11px; color: #8a90a8; text-align: center;">
        MyRashifal+ &mdash; Vedic Astrology &amp; Kundli &mdash; <a href="https://myrashifal.in" style="color: #8a90a8;">myrashifal.in</a>
      </p>
    </div>
  `;
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'pending';

    let astrologers;
    if (filter === 'pending') {
      astrologers = await getPendingAstrologers();
    } else {
      astrologers = await getAllAstrologers();
    }

    return NextResponse.json({ astrologers });
  } catch (error) {
    console.error('Admin get astrologers error:', error);
    return NextResponse.json({ error: 'Failed to get astrologers' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { astrologerId, status } = await request.json();

    if (!astrologerId || !['approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch astrologer details before update (for email)
    const astrologer = await getAstrologerById(astrologerId);

    await updateAstrologerStatus(astrologerId, status);

    // Send email notification (fire-and-forget)
    if (astrologer?.email && process.env.RESEND_API_KEY && ['approved', 'rejected'].includes(status)) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <onboarding@resend.dev>';

        resend.emails.send({
          from: fromEmail,
          to: astrologer.email,
          subject: status === 'approved'
            ? 'MyRashifal+ — Your Astrologer Profile is Approved!'
            : 'MyRashifal+ — Registration Update',
          html: buildStatusEmail(astrologer.name, status),
        }).catch((err) => console.error('Status email failed:', err.message));
      } catch (emailErr) {
        console.error('Resend init failed:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, message: `Astrologer ${status}` });
  } catch (error) {
    console.error('Admin update astrologer error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
