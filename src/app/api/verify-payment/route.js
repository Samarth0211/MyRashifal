import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { savePurchaseToDB } from '@/lib/db';

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      reportType,
      amount,
      kundliId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Generate expected signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      // Save purchase to MongoDB if user is authenticated
      const session = await auth();
      if (session?.user?.id) {
        await savePurchaseToDB(session.user.id, {
          reportType,
          kundliId: kundliId || null,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amount: amount || null,
        });
      }

      return NextResponse.json({
        verified: true,
        paymentId: razorpay_payment_id,
        reportType,
      });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
