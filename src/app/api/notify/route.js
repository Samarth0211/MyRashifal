import { NextResponse } from 'next/server';
import { addNotifyEmail } from '@/lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await addNotifyEmail(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 });
  }
}
