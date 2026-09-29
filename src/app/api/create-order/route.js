import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { v4 as uuid } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { amount, currency, reportType, kundliId, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const options = {
      amount: amount.toString(), // amount in paise
      currency: currency || 'INR',
      receipt: `receipt_${uuid().slice(0, 8)}`,
      notes: {
        reportType: reportType || 'unknown',
        kundliId: kundliId || '',
        ...notes,
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
