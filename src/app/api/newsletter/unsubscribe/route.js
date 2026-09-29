import { NextResponse } from 'next/server';
import { removeSubscriber } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
    }

    await removeSubscriber(token);

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(new URL('/unsubscribe?success=false', request.url));
  }
}
