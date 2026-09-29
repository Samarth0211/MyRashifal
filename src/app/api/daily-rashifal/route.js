import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON } from '@/lib/claude';
import {
  getDailyRashifalPrompt,
  getWeeklyRashifalPrompt,
  getMonthlyRashifalPrompt,
  getYearlyRashifalPrompt,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

// Simple in-memory cache
const cache = new Map();

const TOKEN_LIMITS = {
  daily: 2000,
  weekly: 2500,
  monthly: 3000,
  yearly: 4000,
};

function getMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getMonthName(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleString('en-US', { month: 'long' });
}

function getYear(dateStr) {
  return new Date(dateStr + 'T12:00:00').getFullYear();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rashi = searchParams.get('rashi');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const lang = searchParams.get('lang') || 'en';
    const period = searchParams.get('period') || 'daily';

    if (!rashi) {
      return NextResponse.json(
        { error: 'Missing required parameter: rashi' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be daily, weekly, monthly, or yearly.' },
        { status: 400 }
      );
    }

    // Build cache key based on period
    let cacheKey;
    if (period === 'daily') {
      cacheKey = `${rashi}_${date}_${lang}_daily`;
    } else if (period === 'weekly') {
      cacheKey = `${rashi}_${getMonday(date)}_${lang}_weekly`;
    } else if (period === 'monthly') {
      cacheKey = `${rashi}_${getMonthName(date)}_${getYear(date)}_${lang}_monthly`;
    } else {
      cacheKey = `${rashi}_${getYear(date)}_${lang}_yearly`;
    }

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), { status: 200 });
    }

    // Build prompt based on period
    let system, user;
    if (period === 'daily') {
      ({ system, user } = getDailyRashifalPrompt(rashi, date, lang));
    } else if (period === 'weekly') {
      ({ system, user } = getWeeklyRashifalPrompt(rashi, getMonday(date), lang));
    } else if (period === 'monthly') {
      ({ system, user } = getMonthlyRashifalPrompt(rashi, getMonthName(date), getYear(date), lang));
    } else {
      ({ system, user } = getYearlyRashifalPrompt(rashi, getYear(date), lang));
    }

    const maxTokens = TOKEN_LIMITS[period];
    const response = await callClaude(system, user, maxTokens);
    const rashifalData = parseClaudeJSON(response);

    // Cache (clean old entries if cache grows too large)
    if (cache.size > 200) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, rashifalData);

    return NextResponse.json(rashifalData, { status: 200 });
  } catch (error) {
    console.error('Rashifal error:', error);
    return NextResponse.json(
      { error: 'Failed to generate rashifal. Please try again.' },
      { status: 500 }
    );
  }
}
