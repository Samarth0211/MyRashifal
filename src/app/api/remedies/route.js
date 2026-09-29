import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON, HAIKU_MODEL } from '@/lib/claude';
import { getFreeRemediesPrompt, getDetailedRemediesPrompt } from '@/lib/prompts';
import { auth } from '@/lib/auth';
import { saveReportToDB, getReportFromDB } from '@/lib/db';

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

    // Free tier: basic weak planets + simple remedies (Haiku)
    if (!detailed) {
      const { system, user } = getFreeRemediesPrompt(kundliData, lang);
      const raw = await callClaude(system, user, 1500, HAIKU_MODEL);
      const result = parseClaudeJSON(raw);
      return NextResponse.json({ ...result, detailed: false });
    }

    // Paid tier: check cached report
    const cached = await getReportFromDB(session.user.id, 'remedies');
    if (cached?.reportData) {
      return NextResponse.json({ ...cached.reportData, detailed: true });
    }

    // Generate detailed remedies (Sonnet)
    const { system, user } = getDetailedRemediesPrompt(kundliData, lang);
    const raw = await callClaude(system, user, 4000);
    const result = parseClaudeJSON(raw);

    const reportData = { ...result, detailed: true };

    // Cache for logged-in users
    await saveReportToDB(session.user.id, 'remedies', reportData);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Remedies error:', error);
    return NextResponse.json({ error: 'Failed to generate remedies' }, { status: 500 });
  }
}
