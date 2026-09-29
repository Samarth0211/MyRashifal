import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getAskQuestionPrompt } from '@/lib/prompts';
import { countUserQuestions, saveQuestionToDB, getKundliFromDB } from '@/lib/db';

const FREE_QUESTION_LIMIT = 5;
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign in required to ask questions' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { question, paymentId, lang = 'en' } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get question count and kundli in parallel
    const [questionCount, kundliData] = await Promise.all([
      countUserQuestions(userId),
      getKundliFromDB(userId),
    ]);

    if (!kundliData) {
      return NextResponse.json(
        { error: 'Generate your Kundli first' },
        { status: 400 }
      );
    }

    const isFree = questionCount < FREE_QUESTION_LIMIT;

    // If not free, require payment
    if (!isFree && !paymentId) {
      return NextResponse.json(
        { error: 'Payment required', freeRemaining: 0, questionCount },
        { status: 402 }
      );
    }

    // Generate answer using Haiku model
    const { system, user } = getAskQuestionPrompt(question, kundliData, lang);
    const response = await callClaude(system, user, 3000, HAIKU_MODEL);
    const answerData = parseClaudeJSON(response);

    // Save to DB
    const result = await saveQuestionToDB(userId, {
      question,
      answer: answerData,
      isFree,
      paymentId: isFree ? null : paymentId,
    });

    const newCount = questionCount + 1;

    return NextResponse.json({
      ...answerData,
      questionId: result.insertedId.toString(),
      questionCount: newCount,
      freeRemaining: Math.max(0, FREE_QUESTION_LIMIT - newCount),
    });
  } catch (error) {
    console.error('Ask question error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer. Please try again.' },
      { status: 500 }
    );
  }
}
