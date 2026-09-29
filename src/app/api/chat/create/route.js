import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';
import { getAstrologerById, createChatSession } from '@/lib/db';
import { PLATFORM_COMMISSION, CHAT_DURATION } from '@/lib/constants';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { astrologerId } = await request.json();
    if (!astrologerId) {
      return NextResponse.json({ error: 'Astrologer ID required' }, { status: 400 });
    }

    const astrologer = await getAstrologerById(astrologerId);
    if (!astrologer || astrologer.status !== 'approved') {
      return NextResponse.json({ error: 'Astrologer not available' }, { status: 404 });
    }

    if (!astrologer.isOnline) {
      return NextResponse.json({ error: 'Astrologer is currently offline' }, { status: 400 });
    }

    const amountPaise = astrologer.pricePerSession * 100;
    const commission = Math.round(amountPaise * PLATFORM_COMMISSION);
    const astrologerPayout = amountPaise - commission;
    const sessionId = uuid();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise.toString(),
      currency: 'INR',
      receipt: `chat_${sessionId.slice(0, 8)}`,
      notes: {
        type: 'chat_session',
        sessionId,
        astrologerId,
      },
    });

    // Create chat session in DB
    await createChatSession({
      sessionId,
      userId: session.user.id,
      astrologerId: astrologer._id.toString(),
      astrologerName: astrologer.name,
      userName: session.user.name || 'User',
      razorpayOrderId: order.id,
      amount: amountPaise,
      commission,
      astrologerPayout,
      duration: CHAT_DURATION,
    });

    return NextResponse.json({
      sessionId,
      orderId: order.id,
      amount: amountPaise,
      astrologerName: astrologer.name,
      duration: CHAT_DURATION,
    });
  } catch (error) {
    console.error('Chat create error:', error);
    return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
  }
}
