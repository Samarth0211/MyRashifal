import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChatSession, getChatMessages, addChatMessage } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const after = searchParams.get('after');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Allow access for both user and astrologer
    const isUser = chatSession.userId === session.user.id;
    const { getAstrologerProfile } = await import('@/lib/db');
    const astrologerProfile = await getAstrologerProfile(session.user.id);
    const isAstrologer = astrologerProfile && chatSession.astrologerId === astrologerProfile._id.toString();

    if (!isUser && !isAstrologer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await getChatMessages(sessionId, after || null);

    return NextResponse.json({
      messages,
      sessionStatus: chatSession.status,
      startedAt: chatSession.startedAt,
      duration: chatSession.duration,
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { sessionId, message } = await request.json();

    if (!sessionId || !message?.trim()) {
      return NextResponse.json({ error: 'Session ID and message required' }, { status: 400 });
    }

    const chatSession = await getChatSession(sessionId);
    if (!chatSession || chatSession.status !== 'active') {
      return NextResponse.json({ error: 'Chat session is not active' }, { status: 400 });
    }

    // Check if session has expired (duration exceeded)
    if (chatSession.startedAt) {
      const elapsed = (Date.now() - new Date(chatSession.startedAt).getTime()) / 1000;
      if (elapsed > chatSession.duration + 10) { // 10s grace period
        return NextResponse.json({ error: 'Chat session has expired' }, { status: 400 });
      }
    }

    // Determine sender role
    const { getAstrologerProfile } = await import('@/lib/db');
    const astrologerProfile = await getAstrologerProfile(session.user.id);
    const isAstrologer = astrologerProfile && chatSession.astrologerId === astrologerProfile._id.toString();
    const sender = isAstrologer ? 'astrologer' : 'user';

    await addChatMessage(sessionId, sender, message.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
