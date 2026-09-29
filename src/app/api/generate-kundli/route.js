import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getFreeKundliInterpretationPrompt } from '@/lib/prompts';
import { calculateKundli } from '@/lib/astro-calc';
import { findCity } from '@/lib/cities';
import { auth } from '@/lib/auth';
import { saveKundliToDB, saveNewKundli, updateKundliInDB, getCachedInterpretation, saveCachedInterpretation, updateSubscriberRashi } from '@/lib/db';
import { createHash } from 'crypto';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// Cache key: same birth details + language = same interpretation
function makeCacheKey(dob, tob, pob, lang) {
  const raw = `${dob}|${tob}|${pob}|${lang}`.toLowerCase().trim();
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

export async function POST(request) {
  try {
    const { lang = 'en', kundliId: existingKundliId, label, ...birthDetails } = await request.json();

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

    // Step 3: Check cache first (same DOB + TOB + city = same chart = same interpretation)
    const cacheKey = makeCacheKey(birthDetails.dob, birthDetails.tob, city.name, lang);
    let interpretation = null;

    try {
      interpretation = await getCachedInterpretation(cacheKey);
    } catch (err) {
      console.error('Cache read failed (non-fatal):', err.message);
    }

    // Step 4: If not cached, call Claude Haiku for interpretation
    if (!interpretation) {
      const { system, user } = getFreeKundliInterpretationPrompt(birthDetails, calculatedData, lang);
      const response = await callClaude(system, user, 2500, HAIKU_MODEL, { usePromptCaching: true });
      interpretation = parseClaudeJSON(response);

      // Save to cache (fire-and-forget)
      saveCachedInterpretation(cacheKey, interpretation).catch((err) =>
        console.error('Cache write failed (non-fatal):', err.message)
      );
    }

    // Step 5: Combine calculated data + AI interpretation
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

    // Step 6: Save to MongoDB if user is logged in
    const session = await auth();
    let kundliId = existingKundliId || null;
    if (session?.user?.id) {
      try {
        if (existingKundliId) {
          // Update existing kundli
          await updateKundliInDB(session.user.id, existingKundliId, result);
          kundliId = existingKundliId;
        } else if (label) {
          // Explicit new kundli with label
          kundliId = await saveNewKundli(session.user.id, result, label);
        } else {
          // Default: upsert primary (backward compat)
          kundliId = await saveKundliToDB(session.user.id, result);
        }
      } catch (err) {
        console.error('Failed to save kundli to DB:', err);
      }
    }

    // Step 7: Update subscriber rashi if user is signed in
    if (session?.user?.email && calculatedData?.rashi) {
      updateSubscriberRashi(session.user.email, birthDetails.dob, calculatedData.rashi)
        .catch(() => {}); // fire-and-forget
    }

    return NextResponse.json({ ...result, kundliId }, { status: 200 });
  } catch (error) {
    console.error('Kundli generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate kundli: ${error.message}` },
      { status: 500 }
    );
  }
}
