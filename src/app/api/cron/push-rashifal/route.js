import { NextResponse } from 'next/server';
import { getActivePushSubscriptions } from '@/lib/db';
import { sendPushNotification } from '@/lib/web-push';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import { getDailyRashifalPrompt } from '@/lib/prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // allow up to 60s for Vercel Pro

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Simple in-memory cache for this invocation
const rashifalCache = new Map();

async function getRashifalSummary(rashi, lang) {
  const cacheKey = `${rashi}_${lang}`;
  if (rashifalCache.has(cacheKey)) return rashifalCache.get(cacheKey);

  const today = new Date().toISOString().split('T')[0];
  const { system, user } = getDailyRashifalPrompt(rashi, today, lang);
  const raw = await callClaude(system, user, 800);
  const data = parseClaudeJSON(raw);

  // Extract a 1-line summary for the push notification
  const summary = data?.overallPrediction
    ? data.overallPrediction.slice(0, 120)
    : data?.summary?.slice(0, 120) || `Today's rashifal for ${rashi} is ready!`;

  rashifalCache.set(cacheKey, summary);
  return summary;
}

export async function GET(request) {
  try {
    // Verify cron secret (Vercel sets this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await getActivePushSubscriptions();
    if (!subscriptions.length) {
      return NextResponse.json({ message: 'No active subscriptions', sent: 0 });
    }

    // Group by rashi+lang for efficiency
    const groups = {};
    for (const sub of subscriptions) {
      const key = `${sub.rashi}_${sub.lang || 'en'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(sub);
    }

    let sent = 0;
    let failed = 0;

    for (const [key, subs] of Object.entries(groups)) {
      const [rashi, lang] = key.split('_');
      if (!RASHIS.includes(rashi)) continue;

      let summary;
      try {
        summary = await getRashifalSummary(rashi, lang);
      } catch {
        summary = `Your daily ${rashi} rashifal is ready!`;
      }

      const payload = {
        title: `${rashi} — Daily Rashifal`,
        body: summary,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        url: '/rashifal',
        tag: `rashifal-${rashi}-${new Date().toISOString().split('T')[0]}`,
      };

      for (const sub of subs) {
        try {
          await sendPushNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          sent++;
        } catch (err) {
          failed++;
          // Remove expired/invalid subscriptions (410 Gone)
          if (err.statusCode === 410 || err.statusCode === 404) {
            try {
              const { removePushSubscription } = await import('@/lib/db');
              await removePushSubscription(sub.endpoint);
            } catch {}
          }
        }
      }
    }

    return NextResponse.json({ message: 'Push notifications sent', sent, failed });
  } catch (error) {
    console.error('Push cron error:', error);
    return NextResponse.json({ error: 'Push cron failed' }, { status: 500 });
  }
}
