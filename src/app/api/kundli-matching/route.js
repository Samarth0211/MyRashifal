import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getMatchingInterpretationPrompt } from '@/lib/prompts';
import { calculateKundli } from '@/lib/astro-calc';
import { findCity } from '@/lib/cities';

export async function POST(request) {
  try {
    const { boy, girl, lang = 'en' } = await request.json();

    if (!boy?.name || !boy?.dob || !boy?.tob || !boy?.pob) {
      return NextResponse.json(
        { error: 'Missing boy birth details' },
        { status: 400 }
      );
    }
    if (!girl?.name || !girl?.dob || !girl?.tob || !girl?.pob) {
      return NextResponse.json(
        { error: 'Missing girl birth details' },
        { status: 400 }
      );
    }

    // Calculate both charts using real ephemeris
    const boyCity = findCity(boy.pob);
    const boyChart = calculateKundli(boy.dob, boy.tob, boyCity.lat, boyCity.lon, boyCity.tzOffset);

    const girlCity = findCity(girl.pob);
    const girlChart = calculateKundli(girl.dob, girl.tob, girlCity.lat, girlCity.lon, girlCity.tzOffset);

    // Send accurate charts to Claude for gun milan scoring + interpretation
    const { system, user } = getMatchingInterpretationPrompt(boyChart, girlChart, boy, girl, lang);
    const response = await callClaude(system, user, 5000);
    const matchingData = parseClaudeJSON(response);

    return NextResponse.json(matchingData, { status: 200 });
  } catch (error) {
    console.error('Kundli matching error:', error);
    return NextResponse.json(
      { error: 'Failed to perform kundli matching. Please try again.' },
      { status: 500 }
    );
  }
}
