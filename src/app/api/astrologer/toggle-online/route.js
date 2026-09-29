import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAstrologerProfile, setAstrologerOnline } from '@/lib/db';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const profile = await getAstrologerProfile(session.user.id);
    if (!profile || profile.status !== 'approved') {
      return NextResponse.json({ error: 'Not an approved astrologer' }, { status: 403 });
    }

    const newStatus = !profile.isOnline;
    await setAstrologerOnline(session.user.id, newStatus);

    return NextResponse.json({ success: true, isOnline: newStatus });
  } catch (error) {
    console.error('Toggle online error:', error);
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 });
  }
}
