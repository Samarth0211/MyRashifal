import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChatSession, rateAstrologer } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { sessionId, rating } = await request.json();

    if (!sessionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid session ID and rating (1-5) required' }, { status: 400 });
    }

    const chatSession = await getChatSession(sessionId);
    if (!chatSession || chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    if (chatSession.status !== 'completed' && chatSession.status !== 'active') {
      return NextResponse.json({ error: 'Cannot rate this session' }, { status: 400 });
    }

    await rateAstrologer(sessionId, chatSession.astrologerId, rating);

    return NextResponse.json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    console.error('Rate astrologer error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
