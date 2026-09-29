import { RASHIS } from './constants';

const BASE_URL = 'https://myrashifal.in/instagram';

// ── Morning post: cycle through 12 rashis by day-of-year ──

export function getMorningRashifal(date) {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % RASHIS.length;
  const rashi = RASHIS[index];
  return {
    rashiId: rashi.id,
    rashiNameEn: rashi.nameEn,
    rashiNameHi: rashi.nameHi,
    imageUrl: `${BASE_URL}/rashifal-${rashi.id}.png`,
    contentKey: `${rashi.id}_${date}`,
  };
}

// ── Evening post: rotate through tip topics ──

const TIP_TOPICS = [
  { id: 'moon-sign', topic: 'Why your Moon Sign matters more than Sun Sign in Vedic Astrology', image: 'tip-moon-sign.png' },
  { id: 'nakshatra', topic: '27 Nakshatras and what they reveal about your personality', image: 'tip-nakshatra.png' },
  { id: 'dasha', topic: 'What is Mahadasha and how it controls your life phases', image: 'tip-dasha.png' },
  { id: 'panchang', topic: "Today's Panchang - Tithi, Nakshatra, Yoga, Karana, and Rahu Kaal", image: 'tip-panchang.png' },
  { id: 'retrograde', topic: 'Retrograde Planets - Why they are NOT always bad', image: 'tip-retrograde.png' },
  { id: 'houses', topic: '12 Houses of Kundli - Which house rules your career, love, and money', image: 'tip-houses.png' },
  { id: 'manglik', topic: 'Manglik Dosha - Truth vs Myths in Marriage Matching', image: 'tip-manglik.png' },
];

export function getEveningTip(date) {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % TIP_TOPICS.length;
  const tip = TIP_TOPICS[index];
  return {
    tipId: tip.id,
    topic: tip.topic,
    imageUrl: `${BASE_URL}/${tip.image}`,
    contentKey: `tip_${tip.id}_${date}`,
  };
}

// ── Weekly ad: rotate through 5 ad creatives ──

const AD_CREATIVES = [
  { id: 'free-kundli', feature: 'Free Vedic Kundli in 30 Seconds', price: 'FREE', image: 'ad-free-kundli.png' },
  { id: 'matching', feature: 'Kundli Matching (Gun Milan)', price: 'FREE', image: 'ad-matching.png' },
  { id: 'career-report', feature: 'Career & Wealth Report', price: '₹49', image: 'ad-career-report.png' },
  { id: 'daily-rashifal', feature: 'Daily Rashifal for All 12 Signs', price: 'FREE', image: 'ad-daily-rashifal.png' },
  { id: 'numerology', feature: 'Numerology Report', price: '₹49', image: 'ad-numerology.png' },
];

export function getWeeklyAd(date) {
  const weekOfYear = getWeekOfYear(date);
  const index = weekOfYear % AD_CREATIVES.length;
  const ad = AD_CREATIVES[index];
  return {
    adId: ad.id,
    feature: ad.feature,
    price: ad.price,
    imageUrl: `${BASE_URL}/${ad.image}`,
    contentKey: `ad_${ad.id}_week${weekOfYear}`,
  };
}

// ── Helpers ──

function getDayOfYear(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / (1000 * 60 * 60 * 24));
}

function getWeekOfYear(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d - start) / (1000 * 60 * 60 * 24 * 7));
}
