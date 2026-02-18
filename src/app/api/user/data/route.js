import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getKundliFromDB, getPurchasesFromDB, getAllReportsFromDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [kundli, purchases, reports] = await Promise.all([
      getKundliFromDB(userId),
      getPurchasesFromDB(userId),
      getAllReportsFromDB(userId),
    ]);

    // Convert purchases array to a map { reportType: true } for easy lookup
    const purchasedTypes = {};
    purchases.forEach((p) => {
      purchasedTypes[p.reportType] = true;
    });

    // Convert reports array to a map { reportType: reportData }
    const reportsMap = {};
    reports.forEach((r) => {
      reportsMap[r.reportType] = r.reportData;
    });

    return NextResponse.json({
      kundli,
      purchases: purchasedTypes,
      reports: reportsMap,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
