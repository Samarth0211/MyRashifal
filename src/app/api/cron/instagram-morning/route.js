import { NextResponse } from 'next/server';
import { callClaude, HAIKU_MODEL } from '@/lib/claude';
import { getInstagramRashifalCaptionPrompt } from '@/lib/prompts';
import { postToInstagram } from '@/lib/instagram';
import { saveInstagramPost, hasRecentPost } from '@/lib/db';
import { getMorningRashifal } from '@/lib/instagram-content';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.INSTAGRAM_USER_ID)) {
      return NextResponse.json({ error: 'Instagram not configured' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const content = getMorningRashifal(today);

    const alreadyPosted = await hasRecentPost('morning_rashifal', content.contentKey);
    if (alreadyPosted) {
      return NextResponse.json({ message: 'Already posted today', contentKey: content.contentKey });
    }

    const { system, user } = getInstagramRashifalCaptionPrompt(
      content.rashiNameEn,
      content.rashiNameHi,
      today
    );
    const caption = await callClaude(system, user, 500, HAIKU_MODEL);

    const { creationId, mediaId } = await postToInstagram(content.imageUrl, caption);

    await saveInstagramPost({
      postType: 'morning_rashifal',
      contentKey: content.contentKey,
      imageUrl: content.imageUrl,
      caption,
      mediaId,
      creationId,
    });

    return NextResponse.json({
      success: true,
      rashi: content.rashiNameEn,
      mediaId,
      contentKey: content.contentKey,
    });
  } catch (error) {
    console.error('Instagram morning cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
