import { NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/db';

export async function POST(request) {
  try {
    const { subscription, rashi, lang = 'en', userId } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid push subscription' }, { status: 400 });
    }
    if (!rashi) {
      return NextResponse.json({ error: 'Rashi is required' }, { status: 400 });
    }

    await savePushSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      rashi,
      lang,
      userId: userId || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
