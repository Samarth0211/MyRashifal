import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import {
  getMatchingInterpretationPrompt,
  getBusinessCompatibilityPrompt,
  getFriendshipCompatibilityPrompt,
} from '@/lib/prompts';
import { calculateKundli } from '@/lib/astro-calc';
import { findCity } from '@/lib/cities';

export async function POST(request) {
  try {
    const { boy, girl, person1, person2, lang = 'en', matchType = 'marriage' } = await request.json();

    // For marriage, use boy/girl. For business/friendship, use person1/person2 (or fall back to boy/girl).
    const p1 = person1 || boy;
    const p2 = person2 || girl;

    if (!p1?.name || !p1?.dob || !p1?.tob || !p1?.pob) {
      return NextResponse.json(
        { error: 'Missing Person 1 birth details' },
        { status: 400 }
      );
    }
    if (!p2?.name || !p2?.dob || !p2?.tob || !p2?.pob) {
      return NextResponse.json(
        { error: 'Missing Person 2 birth details' },
        { status: 400 }
      );
    }

    // Calculate both charts using real ephemeris
    const city1 = findCity(p1.pob);
    const chart1 = calculateKundli(p1.dob, p1.tob, city1.lat, city1.lon, city1.tzOffset);

    const city2 = findCity(p2.pob);
    const chart2 = calculateKundli(p2.dob, p2.tob, city2.lat, city2.lon, city2.tzOffset);

    // Select prompt based on matchType
    let promptData;
    let maxTokens = 5000;

    if (matchType === 'business') {
      promptData = getBusinessCompatibilityPrompt(chart1, chart2, p1, p2, lang);
      maxTokens = 3000;
    } else if (matchType === 'friendship') {
      promptData = getFriendshipCompatibilityPrompt(chart1, chart2, p1, p2, lang);
      maxTokens = 3000;
    } else {
      // Default: marriage (Ashtakoot Gun Milan)
      promptData = getMatchingInterpretationPrompt(chart1, chart2, p1, p2, lang);
    }

    const { system, user } = promptData;
    const response = await callClaude(system, user, maxTokens);
    const matchingData = parseClaudeJSON(response);

    return NextResponse.json({ ...matchingData, matchType }, { status: 200 });
  } catch (error) {
    console.error('Kundli matching error:', error);
    return NextResponse.json(
      { error: 'Failed to perform matching. Please try again.' },
      { status: 500 }
    );
  }
}
