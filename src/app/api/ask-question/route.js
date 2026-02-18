import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getAskQuestionPrompt } from '@/lib/prompts';

export async function POST(request) {
  try {
    const { question, kundliData } = await request.json();

    if (!question || !kundliData) {
      return NextResponse.json(
        { error: 'Missing question or kundli data' },
        { status: 400 }
      );
    }

    const { system, user } = getAskQuestionPrompt(question, kundliData);
    const response = await callClaude(system, user, 3000);
    const answerData = parseClaudeJSON(response);

    return NextResponse.json(answerData, { status: 200 });
  } catch (error) {
    console.error('Ask question error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer. Please try again.' },
      { status: 500 }
    );
  }
}
