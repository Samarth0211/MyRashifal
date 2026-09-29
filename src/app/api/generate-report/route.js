import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getReportPrompt } from '@/lib/prompts';
import { auth } from '@/lib/auth';
import { saveReportToDB, getReportFromDB } from '@/lib/db';

export async function POST(request) {
  try {
    const { kundliData, reportType, kundliId, lang = 'en' } = await request.json();

    if (!kundliData || !reportType) {
      return NextResponse.json(
        { error: 'Missing kundli data or report type' },
        { status: 400 }
      );
    }

    const validTypes = ['career', 'marriage', 'health', 'varshphal', 'education', 'complete', 'gemstone', 'child', 'property', 'foreign', 'sadesati'];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }

    // Check if user has a cached report in DB (saves Claude API costs)
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      const cachedReport = await getReportFromDB(userId, reportType, kundliId || null);
      if (cachedReport) {
        return NextResponse.json(cachedReport, { status: 200 });
      }
    }

    // Generate fresh report via Claude
    const maxTokens = reportType === 'complete' ? 16000 : 8000;
    const { system, user } = getReportPrompt(kundliData, reportType, lang);
    const response = await callClaude(system, user, maxTokens);
    const reportData = parseClaudeJSON(response);

    // Save to DB for logged-in users
    if (userId) {
      await saveReportToDB(userId, reportType, reportData, kundliId || null);
    }

    return NextResponse.json(reportData, { status: 200 });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}
