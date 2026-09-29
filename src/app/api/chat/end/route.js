import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChatSession, updateChatSession } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only participant can end session
    const { getAstrologerProfile } = await import('@/lib/db');
    const astrologerProfile = await getAstrologerProfile(session.user.id);
    const isUser = chatSession.userId === session.user.id;
    const isAstrologer = astrologerProfile && chatSession.astrologerId === astrologerProfile._id.toString();

    if (!isUser && !isAstrologer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (chatSession.status === 'completed') {
      return NextResponse.json({ message: 'Session already ended' });
    }

    await updateChatSession(sessionId, {
      status: 'completed',
      endedAt: new Date(),
    });

    // Update astrologer stats
    if (astrologerProfile) {
      const db = (await import('@/lib/mongodb')).default;
      const client = await db;
      const mdb = client.db('myrashifal');
      const { ObjectId } = await import('mongodb');
      await mdb.collection('astrologers').updateOne(
        { _id: new ObjectId(chatSession.astrologerId) },
        {
          $inc: {
            totalSessions: 1,
            totalEarnings: chatSession.astrologerPayout,
          },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({ success: true, message: 'Session ended' });
  } catch (error) {
    console.error('End chat error:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
