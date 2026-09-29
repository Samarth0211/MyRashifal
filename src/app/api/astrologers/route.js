import { NextResponse } from 'next/server';
import { getApprovedAstrologers } from '@/lib/db';

export async function GET() {
  try {
    const astrologers = await getApprovedAstrologers();

    // Sanitize — don't expose phone/email to public
    const safe = astrologers.map(a => ({
      _id: a._id,
      name: a.name,
      specializations: a.specializations,
      experience: a.experience,
      languages: a.languages,
      bio: a.bio,
      pricePerSession: a.pricePerSession,
      rating: a.rating,
      totalSessions: a.totalSessions,
      isOnline: a.isOnline,
    }));

    return NextResponse.json({ astrologers: safe });
  } catch (error) {
    console.error('Get astrologers error:', error);
    return NextResponse.json({ error: 'Failed to load astrologers' }, { status: 500 });
  }
}
