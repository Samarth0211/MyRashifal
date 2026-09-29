import { NextResponse } from 'next/server';
import { removePushSubscription } from '@/lib/db';

export async function POST(request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await removePushSubscription(endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
