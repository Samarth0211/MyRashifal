import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON, HAIKU_MODEL } from '@/lib/claude';
import { getTransitInterpretationPrompt } from '@/lib/prompts';
import { calculateTransits } from '@/lib/transit-calc';
import { auth } from '@/lib/auth';
import { saveReportToDB, getReportFromDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { kundliData, lang = 'en', detailed = false } = await request.json();

    if (!kundliData) {
      return NextResponse.json({ error: 'Kundli data is required' }, { status: 400 });
    }

    // Always compute current transit positions (free)
    const transitData = calculateTransits(kundliData);

    if (!detailed) {
      return NextResponse.json({ ...transitData, detailed: false });
    }

    // Paid tier: check cached report (cache key includes date so it refreshes daily)
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `transits_${today}`;
    const cached = await getReportFromDB(session.user.id, cacheKey);
    if (cached?.reportData) {
      return NextResponse.json({ ...cached.reportData, detailed: true });
    }

    // Generate AI interpretation (Haiku for cost efficiency)
    const { system, user } = getTransitInterpretationPrompt(kundliData, transitData, lang);
    const raw = await callClaude(system, user, 3000, HAIKU_MODEL);
    const interpretation = parseClaudeJSON(raw);

    const reportData = { ...transitData, interpretation, detailed: true };

    await saveReportToDB(session.user.id, cacheKey, reportData);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Transits error:', error);
    return NextResponse.json({ error: 'Failed to calculate transits' }, { status: 500 });
  }
}
