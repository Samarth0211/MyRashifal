import * as Astronomy from 'astronomy-engine';
import {
  getLahiriAyanamsa,
  normalizeDeg,
  getSunLongitude,
  getMoonLongitude,
  getNakshatraFromLon,
  getSignFromLon,
} from './astro-calc';

// 30 Tithis
const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

// 27 Yogas
const YOGA_NAMES = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

// 11 Karana types (7 repeating + 4 fixed)
const KARANA_NAMES_REPEATING = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
];
const KARANA_NAMES_FIXED = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];

// Rahu Kaal — based on 8 equal parts of day (sunrise to sunset)
// Index = day of week (0=Sun, 1=Mon, ...)
// Value = which 1.5hr slot (1-indexed) is Rahu Kaal
const RAHU_KAAL_SLOT = [8, 2, 7, 5, 6, 4, 3]; // Sun=8th, Mon=2nd, etc.

function getKaranaName(karanaIndex) {
  // Karanas 1-57 use 7 repeating names, 58-60 + 0 use 4 fixed
  // There are 60 karanas in a lunar month (2 per tithi)
  const idx = ((karanaIndex % 60) + 60) % 60;
  if (idx === 0) return KARANA_NAMES_FIXED[3]; // Kimstughna (last of month)
  if (idx >= 57) return KARANA_NAMES_FIXED[idx - 57]; // Shakuni, Chatushpada, Naga
  return KARANA_NAMES_REPEATING[(idx - 1) % 7];
}

export function calculatePanchang(dateStr, latitude, longitude, tzOffsetMinutes) {
  // Parse date
  const [year, month, day] = dateStr.split('-').map(Number);

  // Create date at noon local time for consistent calculations
  const localNoon = Date.UTC(year, month - 1, day, 12, 0, 0);
  const utcNoon = new Date(localNoon - tzOffsetMinutes * 60 * 1000);

  // Ayanamsa
  const ayanamsa = getLahiriAyanamsa(utcNoon);

  // Sun and Moon tropical longitudes
  const sunTropical = getSunLongitude(utcNoon);
  const moonTropical = getMoonLongitude(utcNoon);

  // Convert to sidereal
  const sunSid = normalizeDeg(sunTropical - ayanamsa);
  const moonSid = normalizeDeg(moonTropical - ayanamsa);

  // --- Tithi ---
  const moonSunDiff = normalizeDeg(moonSid - sunSid);
  const tithiIndex = Math.floor(moonSunDiff / 12);
  const tithiName = TITHI_NAMES[tithiIndex];
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const tithiNumber = (tithiIndex % 15) + 1;

  // --- Nakshatra ---
  const nakshatra = getNakshatraFromLon(moonSid);

  // --- Yoga ---
  const yogaSum = normalizeDeg(moonSid + sunSid);
  const yogaIndex = Math.floor(yogaSum / (360 / 27));
  const yogaName = YOGA_NAMES[yogaIndex % 27];

  // --- Karana ---
  const karanaIndex = Math.floor(moonSunDiff / 6);
  const karanaName = getKaranaName(karanaIndex);

  // --- Sun and Moon signs ---
  const sunSign = getSignFromLon(sunSid);
  const moonSign = getSignFromLon(moonSid);

  // --- Sunrise / Sunset ---
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const searchStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  let sunrise = null;
  let sunset = null;
  try {
    const riseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, searchStart, 1);
    if (riseResult) {
      sunrise = new Date(riseResult.date.getTime() + tzOffsetMinutes * 60 * 1000);
    }
    const setResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, searchStart, 1);
    if (setResult) {
      sunset = new Date(setResult.date.getTime() + tzOffsetMinutes * 60 * 1000);
    }
  } catch {
    // Fallback for polar regions
  }

  // --- Rahu Kaal ---
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  let rahuKaal = null;
  if (sunrise && sunset) {
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const slotDuration = dayDuration / 8;
    const slot = RAHU_KAAL_SLOT[dayOfWeek];
    const rahuStart = new Date(sunrise.getTime() + (slot - 1) * slotDuration);
    const rahuEnd = new Date(rahuStart.getTime() + slotDuration);
    rahuKaal = {
      start: rahuStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      end: rahuEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  }

  return {
    date: dateStr,
    tithi: {
      name: tithiName,
      number: tithiNumber,
      paksha,
    },
    nakshatra: {
      name: nakshatra.name,
      lord: nakshatra.lord,
      pada: nakshatra.pada,
    },
    yoga: yogaName,
    karana: karanaName,
    sunSign,
    moonSign,
    sunrise: sunrise
      ? sunrise.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null,
    sunset: sunset
      ? sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null,
    rahuKaal,
  };
}
