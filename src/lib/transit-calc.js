import {
  getLahiriAyanamsa,
  normalizeDeg,
  getSunLongitude,
  getMoonLongitude,
  getPlanetLongitude,
  getMeanLunarNode,
  getSignFromLon,
  getSignIndex,
  getNakshatraFromLon,
} from './astro-calc';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const PLANET_NAMES = {
  sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury',
  jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu',
};

/**
 * Calculate current transit positions and their houses relative to
 * the user's natal Moon sign and Lagna.
 */
export function calculateTransits(kundliData) {
  const now = new Date();
  const ayanamsa = getLahiriAyanamsa(now);

  // Birth chart references
  const natalMoonSignIndex = SIGNS.indexOf(kundliData.moonSign?.sign);
  const natalLagnaSignIndex = SIGNS.indexOf(kundliData.lagna?.sign);

  // Calculate current tropical positions → sidereal
  const tropicalPositions = {};
  tropicalPositions.sun = getSunLongitude(now);
  tropicalPositions.moon = getMoonLongitude(now);

  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
    tropicalPositions[name.toLowerCase()] = getPlanetLongitude(name, now);
  }
  tropicalPositions.rahu = getMeanLunarNode(now);
  tropicalPositions.ketu = normalizeDeg(tropicalPositions.rahu + 180);

  const transitPlanets = [];

  for (const id of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']) {
    const tropLon = tropicalPositions[id];
    const sidLon = normalizeDeg(tropLon - ayanamsa);
    const sign = getSignFromLon(sidLon);
    const signIndex = getSignIndex(sidLon);
    const nakshatra = getNakshatraFromLon(sidLon);

    const houseFromMoon = natalMoonSignIndex >= 0
      ? ((signIndex - natalMoonSignIndex + 12) % 12) + 1
      : null;
    const houseFromLagna = natalLagnaSignIndex >= 0
      ? ((signIndex - natalLagnaSignIndex + 12) % 12) + 1
      : null;

    transitPlanets.push({
      id,
      name: PLANET_NAMES[id],
      sign,
      nakshatra: nakshatra.name,
      houseFromMoon,
      houseFromLagna,
    });
  }

  // Identify major transits (slow planets in sensitive houses)
  const majorTransits = [];
  const slowPlanets = ['saturn', 'jupiter', 'rahu', 'ketu'];
  const sensitiveHouses = [1, 4, 7, 8, 10, 12]; // key houses

  for (const tp of transitPlanets) {
    if (slowPlanets.includes(tp.id) && tp.houseFromMoon !== null) {
      if (sensitiveHouses.includes(tp.houseFromMoon)) {
        let impact = 'neutral';
        // Saturn in 1,4,7,8,10,12 = challenging; Jupiter in 1,5,9 = benefic
        if (tp.id === 'saturn' && [1, 4, 7, 8, 12].includes(tp.houseFromMoon)) {
          impact = 'challenging';
        } else if (tp.id === 'jupiter' && [1, 5, 9].includes(tp.houseFromMoon)) {
          impact = 'benefic';
        } else if ((tp.id === 'rahu' || tp.id === 'ketu') && [1, 4, 7, 8, 12].includes(tp.houseFromMoon)) {
          impact = 'challenging';
        }

        majorTransits.push({
          planet: tp.name,
          sign: tp.sign,
          houseFromMoon: tp.houseFromMoon,
          impact,
          description: `${tp.name} transiting ${tp.sign} (${getOrdinal(tp.houseFromMoon)} house from Moon)`,
        });
      }
    }
  }

  // Check for Sade Sati (Saturn within 1 sign of Moon)
  const saturn = transitPlanets.find((p) => p.id === 'saturn');
  let sadeSati = null;
  if (saturn && natalMoonSignIndex >= 0) {
    const satSignIndex = SIGNS.indexOf(saturn.sign);
    const diff = ((satSignIndex - natalMoonSignIndex + 12) % 12);
    if (diff === 11) sadeSati = { phase: 'Rising (1st phase)', active: true };
    else if (diff === 0) sadeSati = { phase: 'Peak (2nd phase)', active: true };
    else if (diff === 1) sadeSati = { phase: 'Setting (3rd phase)', active: true };
  }

  return {
    date: now.toISOString().split('T')[0],
    ayanamsa: ayanamsa.toFixed(4),
    transitPlanets,
    majorTransits,
    sadeSati,
    natalMoonSign: kundliData.moonSign?.sign || 'Unknown',
    natalLagna: kundliData.lagna?.sign || 'Unknown',
  };
}

function getOrdinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}
