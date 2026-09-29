import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getReportPrompt } from '@/lib/prompts';
import { auth } from '@/lib/auth';
import {
  countPurchasesByReportType,
  savePurchaseToDB,
  saveReportToDB,
  getReportFromDB,
  getKundliByIdFromDB,
} from '@/lib/db';

const LOYALTY_THRESHOLD = 3;

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { reportType, kundliId, lang = 'en' } = await request.json();

    if (!reportType || !kundliId) {
      return NextResponse.json({ error: 'Missing reportType or kundliId' }, { status: 400 });
    }

    const validTypes = ['career', 'marriage', 'health', 'varshphal', 'education', 'complete', 'gemstone', 'child', 'property', 'foreign', 'sadesati'];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    const userId = session.user.id;

    // Verify loyalty eligibility: need >= LOYALTY_THRESHOLD paid purchases of this report type
    const paidCount = await countPurchasesByReportType(userId, reportType);
    if (paidCount < LOYALTY_THRESHOLD) {
      return NextResponse.json(
        { error: `Need ${LOYALTY_THRESHOLD} paid purchases. You have ${paidCount}.` },
        { status: 403 }
      );
    }

    // Check if report already exists for this kundli
    const existing = await getReportFromDB(userId, reportType, kundliId);
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    // Fetch the kundli data
    const kundliData = await getKundliByIdFromDB(userId, kundliId);
    if (!kundliData) {
      return NextResponse.json({ error: 'Kundli not found' }, { status: 404 });
    }

    // Save free purchase record
    await savePurchaseToDB(userId, {
      reportType,
      kundliId,
      paymentId: `loyalty_free_${Date.now()}`,
      amount: 0,
      isFree: true,
    });

    // Generate report
    const maxTokens = reportType === 'complete' ? 16000 : 8000;
    const { system, user } = getReportPrompt(kundliData, reportType, lang);
    const response = await callClaude(system, user, maxTokens);
    const reportData = parseClaudeJSON(response);

    await saveReportToDB(userId, reportType, reportData, kundliId);

    return NextResponse.json(reportData, { status: 200 });
  } catch (error) {
    console.error('Loyalty report claim error:', error);
    return NextResponse.json(
      { error: 'Failed to claim loyalty report' },
      { status: 500 }
    );
  }
}
