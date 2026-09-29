import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAstrologerProfile, updateAstrologerProfile } from '@/lib/db';

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

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Get astrologer profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const profile = await getAstrologerProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Not registered as astrologer' }, { status: 404 });
    }

    const { name, phone, specializations, experience, languages, bio, pricePerSession } = await request.json();

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (specializations?.length) updates.specializations = specializations;
    if (experience) updates.experience = Number(experience);
    if (languages?.length) updates.languages = languages;
    if (bio !== undefined) updates.bio = bio;
    if (pricePerSession && pricePerSession >= 10 && pricePerSession <= 10000) {
      updates.pricePerSession = Number(pricePerSession);
    }

    await updateAstrologerProfile(session.user.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update astrologer profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
