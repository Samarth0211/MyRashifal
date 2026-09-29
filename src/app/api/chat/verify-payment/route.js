import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { getChatSession, updateChatSession } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sessionId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !sessionId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Verify session belongs to user
    const chatSession = await getChatSession(sessionId);
    if (!chatSession || chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Activate session
    await updateChatSession(sessionId, {
      razorpayPaymentId: razorpay_payment_id,
      status: 'active',
      startedAt: new Date(),
    });

    return NextResponse.json({
      verified: true,
      sessionId,
      message: 'Chat session activated',
    });
  } catch (error) {
    console.error('Chat verify-payment error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
