import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAstrologerProfile, getAstrologerSessions } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const profile = await getAstrologerProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Not registered as astrologer' }, { status: 404 });
    }

    const sessions = await getAstrologerSessions(profile._id.toString());
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get astrologer sessions error:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}
