import { NextResponse } from 'next/server';
import { exchangeForLongLivedToken } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!currentToken) {
      return NextResponse.json({ error: 'No INSTAGRAM_ACCESS_TOKEN set' }, { status: 500 });
    }

    const result = await exchangeForLongLivedToken(currentToken);
    const expiresIn = result.expires_in; // seconds
    const expiresDate = new Date(Date.now() + expiresIn * 1000);

    return NextResponse.json({
      success: true,
      newToken: result.access_token,
      tokenType: result.token_type,
      expiresInDays: Math.round(expiresIn / 86400),
      expiresAt: expiresDate.toISOString(),
      instruction: 'Copy the newToken value and update INSTAGRAM_ACCESS_TOKEN in Vercel env vars, then redeploy.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
