import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getMuhuratPrompt } from '@/lib/prompts';

export async function POST(request) {
  try {
    const { eventType, startDate, endDate, birthDetails, lang = 'en' } = await request.json();

    if (!eventType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, startDate, endDate' },
        { status: 400 }
      );
    }

    const { system, user } = getMuhuratPrompt(eventType, startDate, endDate, birthDetails, lang);
    const response = await callClaude(system, user, 4000);
    const muhuratData = parseClaudeJSON(response);

    return NextResponse.json(muhuratData, { status: 200 });
  } catch (error) {
    console.error('Muhurat generation error:', error);
    return NextResponse.json(
      { error: 'Failed to find muhurats. Please try again.' },
      { status: 500 }
    );
  }
}
