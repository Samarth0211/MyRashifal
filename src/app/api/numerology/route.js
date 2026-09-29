import { NextResponse } from 'next/server';
import { calculateAllNumbers, LIFE_PATH_MEANINGS } from '@/lib/numerology-calc';
import { callClaude, parseClaudeJSON, HAIKU_MODEL } from '@/lib/claude';
import { getNumerologyPrompt } from '@/lib/prompts';
import { auth } from '@/lib/auth';
import { saveReportToDB, getReportFromDB } from '@/lib/db';

export async function POST(request) {
  try {
    const { name, dob, lang = 'en', detailed = false } = await request.json();

    if (!name || !dob) {
      return NextResponse.json({ error: 'Name and date of birth are required' }, { status: 400 });
    }

    const numbers = calculateAllNumbers(name, dob);

    // Free tier: return numbers + static meanings
    if (!detailed) {
      return NextResponse.json({
        numbers,
        meanings: {
          lifePath: LIFE_PATH_MEANINGS[numbers.lifePath] || LIFE_PATH_MEANINGS[numbers.lifePath % 10] || '',
          expression: LIFE_PATH_MEANINGS[numbers.expression] || '',
          soulUrge: LIFE_PATH_MEANINGS[numbers.soulUrge] || '',
          personality: LIFE_PATH_MEANINGS[numbers.personality] || '',
          birthday: LIFE_PATH_MEANINGS[numbers.birthday] || '',
        },
        detailed: false,
      });
    }

    // Paid tier: check auth and cached report
    const session = await auth();
    if (session?.user?.id) {
      const cached = await getReportFromDB(session.user.id, 'numerology');
      if (cached?.reportData?.name === name && cached?.reportData?.dob === dob) {
        return NextResponse.json({ numbers, ...cached.reportData, detailed: true });
      }
    }

    // Generate detailed AI interpretation
    const { systemPrompt, userPrompt } = getNumerologyPrompt({ name, dob, numbers }, lang);
    const raw = await callClaude(systemPrompt, userPrompt, 4000, HAIKU_MODEL);
    const interpretation = parseClaudeJSON(raw);

    const result = {
      numbers,
      name,
      dob,
      ...interpretation,
      detailed: true,
    };

    // Cache for logged-in users
    if (session?.user?.id) {
      await saveReportToDB(session.user.id, 'numerology', result);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Numerology error:', error);
    return NextResponse.json({ error: 'Failed to calculate numerology' }, { status: 500 });
  }
}
