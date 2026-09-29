import { NextResponse } from 'next/server';
import { calculatePanchang } from '@/lib/panchang-calc';
import { findCity } from '@/lib/cities';

// In-memory cache
const cache = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const cityParam = searchParams.get('city') || 'Delhi';

    const cacheKey = `${dateParam}_${cityParam}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const city = findCity(cityParam);
    const result = calculatePanchang(dateParam, city.lat, city.lon, city.tzOffset);
    result.city = { name: city.name, state: city.state };

    // Cache (limit size)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Panchang error:', error);
    return NextResponse.json({ error: 'Failed to calculate panchang' }, { status: 500 });
  }
}
