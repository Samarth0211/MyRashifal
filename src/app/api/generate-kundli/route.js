import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getKundliInterpretationPrompt } from '@/lib/prompts';
import { calculateKundli } from '@/lib/astro-calc';
import { findCity } from '@/lib/cities';
import { auth } from '@/lib/auth';
import { saveKundliToDB } from '@/lib/db';

export async function POST(request) {
  try {
    const birthDetails = await request.json();

    // Validate required fields
    if (!birthDetails.name || !birthDetails.dob || !birthDetails.tob || !birthDetails.pob) {
      return NextResponse.json(
        { error: 'Missing required birth details: name, dob, tob, pob' },
        { status: 400 }
      );
    }

    // Step 1: Geocode the birth place
    const city = findCity(birthDetails.pob);

    // Step 2: Calculate accurate planetary positions using astronomy-engine
    const calculatedData = calculateKundli(
      birthDetails.dob,
      birthDetails.tob,
      city.lat,
      city.lon,
      city.tzOffset
    );

    // Step 3: Call Claude ONLY for interpretation (not calculation)
    const { system, user } = getKundliInterpretationPrompt(birthDetails, calculatedData);
    const response = await callClaude(system, user, 4000);
    const interpretation = parseClaudeJSON(response);

    // Step 4: Combine calculated data + AI interpretation
    const result = {
      birthDetails: {
        name: birthDetails.name,
        dob: birthDetails.dob,
        tob: birthDetails.tob,
        pob: birthDetails.pob,
        gender: birthDetails.gender || 'Not specified',
        coordinates: { lat: city.lat, lon: city.lon, city: city.name },
      },
      ...calculatedData,
      // Add AI interpretation (structured sections + legacy fallback)
      personalitySections: interpretation.personalitySections || null,
      personality: interpretation.personality || '',
      yogas: interpretation.yogas?.filter(y => y.present !== false) || [],
      currentDasha: {
        ...calculatedData.currentDasha,
        interpretation: interpretation.dashaInterpretation || '',
      },
    };

    // Step 5: Save to MongoDB if user is logged in
    const session = await auth();
    if (session?.user?.id) {
      await saveKundliToDB(session.user.id, result).catch((err) =>
        console.error('Failed to save kundli to DB:', err)
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Kundli generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate kundli: ${error.message}` },
      { status: 500 }
    );
  }
}
