import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveKundliToDB, saveNewKundli, updateKundliInDB } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { kundliId: existingKundliId, label, ...kundliData } = await request.json();

    if (!kundliData?.birthDetails?.name || !kundliData?.birthDetails?.dob ||
        !kundliData?.planets || !kundliData?.houses) {
      return NextResponse.json(
        { error: 'Invalid kundli data' },
        { status: 400 }
      );
    }

    let kundliId;
    if (existingKundliId) {
      await updateKundliInDB(session.user.id, existingKundliId, kundliData);
      kundliId = existingKundliId;
    } else if (label) {
      kundliId = await saveNewKundli(session.user.id, kundliData, label);
    } else {
      kundliId = await saveKundliToDB(session.user.id, kundliData);
    }

    return NextResponse.json({ success: true, kundliId });
  } catch (error) {
    console.error('Save kundli error:', error);
    return NextResponse.json(
      { error: 'Failed to save kundli' },
      { status: 500 }
    );
  }
}
