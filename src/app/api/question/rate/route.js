import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateQuestion } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { questionId, rating } = await request.json();

    if (!questionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid questionId and rating (1-5) required' },
        { status: 400 }
      );
    }

    const result = await rateQuestion(questionId, session.user.id, rating);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rate question error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
