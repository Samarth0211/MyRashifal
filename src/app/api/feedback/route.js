import { NextResponse } from 'next/server';
import { saveFeedbackToDB } from '@/lib/db';

const OWNER_EMAIL = 'bhamaresamarth@gmail.com';

export async function POST(request) {
  let step = 'init';
  try {
    step = 'parse-body';
    const { name, email, category, rating, message, lang } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if user is logged in (non-blocking)
    let userId = null;
    try {
      step = 'auth';
      const { auth } = await import('@/lib/auth');
      const session = await auth();
      userId = session?.user?.id || null;
    } catch (authErr) {
      console.error('Auth check failed (non-blocking):', authErr.message);
    }

    const feedback = {
      userId,
      name: name || 'Anonymous',
      email: email || '',
      category: category || 'general',
      rating: rating || 0,
      message: message.trim(),
      lang: lang || 'en',
    };

    // Save to MongoDB
    step = 'save-db';
    await saveFeedbackToDB(feedback);

    // Send email notification (fire-and-forget)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <onboarding@resend.dev>';
        const stars = rating > 0 ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : 'Not rated';

        resend.emails.send({
          from: fromEmail,
          to: OWNER_EMAIL,
          subject: `[MyRashifal+ Feedback] ${category.toUpperCase()} - ${stars}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
              <h2 style="color: #e8bf4b; margin-bottom: 16px;">New Feedback Received</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8a90a8; width: 100px;">From:</td>
                  <td style="padding: 8px 0;">${feedback.name} ${feedback.email ? `(${feedback.email})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a90a8;">Category:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">${feedback.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a90a8;">Rating:</td>
                  <td style="padding: 8px 0; font-size: 18px; color: #e8bf4b;">${stars}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a90a8;">User ID:</td>
                  <td style="padding: 8px 0; font-size: 12px;">${userId || 'Anonymous'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8a90a8;">Language:</td>
                  <td style="padding: 8px 0;">${lang}</td>
                </tr>
              </table>
              <div style="margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid #c9951a;">
                <p style="color: #8a90a8; margin: 0 0 8px; font-size: 13px;">Message:</p>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${feedback.message}</p>
              </div>
              <p style="margin-top: 20px; font-size: 11px; color: #8a90a8;">Sent from myrashifal.in feedback form</p>
            </div>
          `,
        }).catch((err) => {
          console.error('Failed to send feedback email:', err.message);
        });
      } catch (emailErr) {
        console.error('Resend init failed:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(`Feedback error at step [${step}]:`, error.message, error.stack);
    return NextResponse.json(
      { error: `Feedback failed at: ${step}. ${error.message}` },
      { status: 500 }
    );
  }
}
