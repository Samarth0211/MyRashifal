import { NextResponse } from 'next/server';
import { refreshLongLivedToken } from '@/lib/instagram';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to refresh the token
    let refreshResult = null;
    let refreshError = null;
    try {
      refreshResult = await refreshLongLivedToken();
    } catch (err) {
      refreshError = err.message;
    }

    // Send email notification
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRashifal+ <noreply@myrashifal.in>';

    if (refreshResult) {
      const expiresAt = new Date(Date.now() + refreshResult.expires_in * 1000);
      await resend.emails.send({
        from: fromEmail,
        to: 'bhamaresamarth@gmail.com',
        subject: 'Instagram Token Auto-Refreshed - MyRashifal+',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
            <h1 style="color: #e8bf4b; font-size: 20px; margin: 0 0 16px;">Instagram Token Refreshed</h1>
            <p style="color: #22c55e; font-size: 14px;">Token refreshed successfully!</p>
            <p style="font-size: 13px; color: #8a90a8;">New token expires: <strong style="color: #eaedf3;">${expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; margin: 16px 0;">
              <p style="font-size: 11px; color: #8a90a8; margin: 0 0 8px;">New token (update on Vercel):</p>
              <code style="font-size: 10px; color: #e8bf4b; word-break: break-all;">${refreshResult.access_token}</code>
            </div>
            <p style="font-size: 12px; color: #8a90a8;">Update <strong>INSTAGRAM_ACCESS_TOKEN</strong> in Vercel dashboard and redeploy.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        expiresAt: expiresAt.toISOString(),
        emailSent: true,
      });
    } else {
      // Token refresh failed — send warning email
      await resend.emails.send({
        from: fromEmail,
        to: 'bhamaresamarth@gmail.com',
        subject: 'WARNING: Instagram Token Refresh Failed - MyRashifal+',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a2e; color: #eaedf3; border-radius: 12px;">
            <h1 style="color: #ef4444; font-size: 20px; margin: 0 0 16px;">Instagram Token Refresh Failed</h1>
            <p style="font-size: 14px; color: #ef4444;">Error: ${refreshError}</p>
            <p style="font-size: 13px; color: #8a90a8;">Your Instagram posts will stop working when the current token expires.</p>
            <p style="font-size: 13px; color: #eaedf3;"><strong>Action needed:</strong></p>
            <ol style="font-size: 13px; color: #8a90a8;">
              <li>Go to <a href="https://developers.facebook.com/tools/explorer/" style="color: #e8bf4b;">Graph API Explorer</a></li>
              <li>Generate a new token with instagram_content_publish permission</li>
              <li>Update INSTAGRAM_ACCESS_TOKEN on Vercel</li>
              <li>Redeploy</li>
            </ol>
          </div>
        `,
      });

      return NextResponse.json({
        success: false,
        error: refreshError,
        emailSent: true,
      });
    }
  } catch (error) {
    console.error('Token refresh cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
