import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getDailyRashifalPrompt } from '@/lib/prompts';

export const dynamic = 'force-dynamic';

// Simple in-memory cache
const cache = new Map();

function getCacheKey(rashi, date) {
  return `${rashi}_${date}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rashi = searchParams.get('rashi');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!rashi) {
      return NextResponse.json(
        { error: 'Missing required parameter: rashi' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(rashi, date);
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), { status: 200 });
    }

    const { system, user } = getDailyRashifalPrompt(rashi, date);
    const response = await callClaude(system, user, 2000);
    const rashifalData = parseClaudeJSON(response);

    // Cache for the day (clean old entries if cache grows too large)
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, rashifalData);

    return NextResponse.json(rashifalData, { status: 200 });
  } catch (error) {
    console.error('Daily rashifal error:', error);
    return NextResponse.json(
      { error: 'Failed to generate rashifal. Please try again.' },
      { status: 500 }
    );
  }
}
