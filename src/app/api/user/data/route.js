import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllKundlisFromDB, getPurchasesFromDB, getAllReportsFromDB, countUserQuestions, getSubscriberByEmail, addSubscriber } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'mr';

    const [kundlis, purchases, reports, questionCount] = await Promise.all([
      getAllKundlisFromDB(userId),
      getPurchasesFromDB(userId),
      getAllReportsFromDB(userId),
      countUserQuestions(userId),
    ]);

    // Auto-subscribe to newsletter if not already subscribed
    if (session.user.email) {
      try {
        const existing = await getSubscriberByEmail(session.user.email);
        if (!existing) {
          const primaryKundliForSub = kundlis.find((k) => k.isPrimary) || kundlis[0] || null;
          await addSubscriber({
            name: session.user.name || '',
            email: session.user.email,
            dob: primaryKundliForSub?.dob || null,
            rashi: primaryKundliForSub?.rashi || null,
            lang,
          });
        }
      } catch {
        // Non-blocking — don't fail user data fetch for newsletter
      }
    }

    // Backward compat: primary kundli
    const primaryKundli = kundlis.find((k) => k.isPrimary) || kundlis[0] || null;

    // Purchases grouped by kundliId
    const purchasesByKundli = {};
    const purchasedTypes = {};
    const purchaseCounts = {};

    purchases.forEach((p) => {
      purchasedTypes[p.reportType] = true;

      const kid = p.kundliId || '_legacy';
      if (!purchasesByKundli[kid]) purchasesByKundli[kid] = {};
      purchasesByKundli[kid][p.reportType] = true;

      if (!p.isFree) {
        purchaseCounts[p.reportType] = (purchaseCounts[p.reportType] || 0) + 1;
      }
    });

    // Reports grouped by kundliId
    const reportsByKundli = {};
    const reportsMap = {};

    reports.forEach((r) => {
      reportsMap[r.reportType] = r.reportData;

      const kid = r.kundliId || '_legacy';
      if (!reportsByKundli[kid]) reportsByKundli[kid] = {};
      reportsByKundli[kid][r.reportType] = r.reportData;
    });

    return NextResponse.json({
      kundli: primaryKundli,
      kundlis,
      purchases: purchasedTypes,
      purchasesByKundli,
      purchaseCounts,
      reports: reportsMap,
      reportsByKundli,
      questionCount,
      purchaseHistory: purchases,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
