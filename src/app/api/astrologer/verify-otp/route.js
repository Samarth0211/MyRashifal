import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyOtp } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { otp } = await request.json();

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ verified: false, error: 'Invalid code' }, { status: 400 });
    }

    const valid = await verifyOtp(session.user.id, otp);

    if (!valid) {
      return NextResponse.json({ verified: false, error: 'Invalid or expired code' }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 });
  }
}
