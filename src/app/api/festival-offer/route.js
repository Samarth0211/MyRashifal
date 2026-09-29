import { NextResponse } from 'next/server';
import { getActiveFestivalOffer } from '@/lib/festivals';

export const dynamic = 'force-dynamic';

export async function GET() {
  const offer = getActiveFestivalOffer();
  return NextResponse.json(offer);
}
