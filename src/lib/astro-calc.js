import * as Astronomy from 'astronomy-engine';

// ============================================================
// CONSTANTS
// ============================================================

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRA_DATA = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Moola', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' },
];

const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const DASHA_ORDER = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

// Exaltation signs
const EXALTATION = {
  sun: 'Aries', moon: 'Taurus', mars: 'Capricorn',
  mercury: 'Virgo', jupiter: 'Cancer', venus: 'Pisces', saturn: 'Libra',
};

// Debilitation signs (opposite of exaltation)
const DEBILITATION = {
  sun: 'Libra', moon: 'Scorpio', mars: 'Cancer',
  mercury: 'Pisces', jupiter: 'Capricorn', venus: 'Virgo', saturn: 'Aries',
};

// Own signs (Moolatrikona + own)
const OWN_SIGNS = {
  sun: ['Leo'],
  moon: ['Cancer'],
  mars: ['Aries', 'Scorpio'],
  mercury: ['Gemini', 'Virgo'],
  jupiter: ['Sagittarius', 'Pisces'],
  venus: ['Taurus', 'Libra'],
  saturn: ['Capricorn', 'Aquarius'],
  rahu: ['Aquarius'],
  ketu: ['Scorpio'],
};

// Planet abbreviations
const ABBR = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me',
  jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function formatDegree(decimalDeg) {
  const d = Math.abs(decimalDeg);
  const degrees = Math.floor(d);
  const minutesDecimal = (d - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
}

function getSignFromLon(siderealLon) {
  return SIGNS[Math.floor(normalizeDeg(siderealLon) / 30)];
}

function getSignIndex(siderealLon) {
  return Math.floor(normalizeDeg(siderealLon) / 30);
}

function getDegreeInSign(siderealLon) {
  return normalizeDeg(siderealLon) % 30;
}

function getNakshatraFromLon(siderealLon) {
  const lon = normalizeDeg(siderealLon);
  const nakSpan = 360 / 27; // 13.3333...°
  const index = Math.floor(lon / nakSpan) % 27;
  const posInNak = lon % nakSpan;
  const pada = Math.floor(posInNak / (nakSpan / 4)) + 1;
  return {
    name: NAKSHATRA_DATA[index].name,
    lord: NAKSHATRA_DATA[index].lord,
    pada,
    index,
  };
}

function getDignity(planetId, sign) {
  if (EXALTATION[planetId] === sign) return 'exalted';
  if (DEBILITATION[planetId] === sign) return 'debilitated';
  if (OWN_SIGNS[planetId]?.includes(sign)) return 'own';
  return 'neutral';
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function addYearsToDate(date, years) {
  const ms = years * 365.25 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

// ============================================================
// LAHIRI AYANAMSA
// ============================================================

function getLahiriAyanamsa(date) {
  // Lahiri ayanamsa calculation
  // Reference epoch: J2000.0 (Jan 1.5, 2000 TT)
  // Ayanamsa at J2000.0 ≈ 23°51'11" = 23.85306°
  // Precession rate ≈ 50.2888 arcseconds/year
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const diffMs = date.getTime() - j2000;
  const years = diffMs / (365.25 * 24 * 3600 * 1000);
  return 23.85306 + (years * 50.2888 / 3600);
}

// ============================================================
// TROPICAL LONGITUDE CALCULATIONS
// (Using astronomy-engine for accurate ephemeris)
// ============================================================

function getSunLongitude(date) {
  const pos = Astronomy.SunPosition(date);
  return pos.elon;
}

function getMoonLongitude(date) {
  const pos = Astronomy.EclipticGeoMoon(date);
  return pos.lon;
}

function getPlanetLongitude(bodyName, date) {
  const bodyMap = {
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
  };
  const body = bodyMap[bodyName];
  if (!body) throw new Error(`Unknown body: ${bodyName}`);
  return Astronomy.EclipticLongitude(body, date);
}

function getMeanLunarNode(date) {
  // Mean longitude of Moon's ascending node (Rahu)
  // Based on Meeus astronomical algorithms
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const T = (date.getTime() - j2000) / (36525 * 24 * 3600 * 1000); // Julian centuries

  // Mean longitude of ascending node (degrees)
  let omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;

  return normalizeDeg(omega);
}

function isRetrograde(bodyName, date) {
  if (bodyName === 'Sun' || bodyName === 'Moon') return false;

  const dayMs = 24 * 3600 * 1000;
  const before = new Date(date.getTime() - dayMs);
  const after = new Date(date.getTime() + dayMs);

  let lonBefore, lonAfter;

  if (bodyName === 'Rahu' || bodyName === 'Ketu') return true; // always retrograde

  try {
    lonBefore = getPlanetLongitude(bodyName, before);
    lonAfter = getPlanetLongitude(bodyName, after);
  } catch {
    return false;
  }

  let motion = lonAfter - lonBefore;
  if (motion > 180) motion -= 360;
  if (motion < -180) motion += 360;
  return motion < 0;
}

// ============================================================
// ASCENDANT (LAGNA) CALCULATION
// ============================================================

function calculateAscendant(date, latitude, longitude) {
  // Calculate Lagna using Local Sidereal Time

  // Greenwich Mean Sidereal Time (in hours)
  const gmst = Astronomy.SiderealTime(date);

  // Local Sidereal Time (in hours)
  let lst = gmst + longitude / 15;
  lst = ((lst % 24) + 24) % 24;

  // Convert LST to degrees (RAMC = Right Ascension of MC)
  const ramc = lst * 15; // degrees

  // Mean obliquity of ecliptic
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const T = (date.getTime() - j2000) / (36525 * 24 * 3600 * 1000);
  const obliquity = 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;

  const oblRad = (obliquity * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;

  // Ascendant formula
  const y = Math.cos(ramcRad);
  const x = -(
    Math.sin(ramcRad) * Math.cos(oblRad) +
    Math.tan(latRad) * Math.sin(oblRad)
  );

  let asc = Math.atan2(y, x);
  asc = (asc * 180) / Math.PI;
  asc = normalizeDeg(asc);

  return asc;
}

// ============================================================
// VIMSHOTTARI DASHA CALCULATION
// ============================================================

function calculateVimshottariDasha(birthDateUTC, moonSiderealLon) {
  const nakSpan = 360 / 27;
  const moonNak = getNakshatraFromLon(moonSiderealLon);
  const nakLord = moonNak.lord;
  const posInNak = normalizeDeg(moonSiderealLon) % nakSpan;

  // Balance of first dasha
  const proportionRemaining = 1 - posInNak / nakSpan;
  const balanceYears = proportionRemaining * DASHA_YEARS[nakLord];

  // Build dasha timeline from birth
  const startLordIndex = DASHA_ORDER.indexOf(nakLord);
  const periods = [];
  let currentTime = new Date(birthDateUTC);

  // First dasha (balance)
  let endTime = addYearsToDate(currentTime, balanceYears);
  periods.push({
    planet: DASHA_ORDER[startLordIndex],
    startDate: new Date(currentTime),
    endDate: new Date(endTime),
    years: balanceYears,
  });
  currentTime = endTime;

  // Subsequent full dashas (2+ full cycles to cover any age)
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 1; i <= 9; i++) {
      const lordIdx = (startLordIndex + i) % 9;
      const lord = DASHA_ORDER[lordIdx];
      const years = DASHA_YEARS[lord];

      endTime = addYearsToDate(currentTime, years);
      periods.push({
        planet: lord,
        startDate: new Date(currentTime),
        endDate: new Date(endTime),
        years,
      });
      currentTime = endTime;
    }
  }

  // Find current Mahadasha
  const now = new Date();
  const currentMaha = periods.find(
    (p) => now >= p.startDate && now < p.endDate
  ) || periods[0];

  // Find current Antardasha within Mahadasha
  const mahaLord = currentMaha.planet;
  const mahaLordIndex = DASHA_ORDER.indexOf(mahaLord);
  let antarStart = new Date(currentMaha.startDate);
  let currentAntar = null;

  for (let i = 0; i < 9; i++) {
    const antarLordIndex = (mahaLordIndex + i) % 9;
    const antarLord = DASHA_ORDER[antarLordIndex];
    const antarDurationMs =
      ((DASHA_YEARS[mahaLord] * DASHA_YEARS[antarLord]) / 120) *
      365.25 * 24 * 3600 * 1000;

    const antarEnd = new Date(antarStart.getTime() + antarDurationMs);

    if (now >= antarStart && now < antarEnd) {
      currentAntar = {
        planet: antarLord,
        startDate: new Date(antarStart),
        endDate: new Date(antarEnd),
      };
      break;
    }
    antarStart = antarEnd;
  }

  return {
    mahadasha: {
      planet: currentMaha.planet,
      startDate: formatDate(currentMaha.startDate),
      endDate: formatDate(currentMaha.endDate),
    },
    antardasha: currentAntar
      ? {
          planet: currentAntar.planet,
          startDate: formatDate(currentAntar.startDate),
          endDate: formatDate(currentAntar.endDate),
        }
      : { planet: 'N/A', startDate: '', endDate: '' },
  };
}

// ============================================================
// MANGLIK DOSHA CHECK
// ============================================================

function checkManglik(marsHouse) {
  // Mars in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const isManglik = manglikHouses.includes(marsHouse);

  let severity = 'none';
  if (isManglik) {
    if (marsHouse === 7 || marsHouse === 8) severity = 'severe';
    else if (marsHouse === 1 || marsHouse === 4 || marsHouse === 12) severity = 'moderate';
    else severity = 'mild';
  }

  return {
    isManglik,
    severity,
    details: isManglik
      ? `Mars is placed in the ${marsHouse}${getOrdinalSuffix(marsHouse)} house from Lagna, which forms Manglik Dosha (${severity} level). This may affect marriage and partnership dynamics.`
      : 'Mars is not placed in any Manglik-forming house (1st, 2nd, 4th, 7th, 8th, or 12th). No Manglik Dosha is present.',
  };
}

function getOrdinalSuffix(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// ============================================================
// MAIN CALCULATION FUNCTION
// ============================================================

export function calculateKundli(birthDate, birthTime, latitude, longitude, tzOffsetMinutes) {
  // Parse date and time
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = birthTime.split(':').map(Number);

  // Create UTC Date object
  // Local time = UTC + tzOffset, so UTC = local - tzOffset
  const localMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const utcMs = localMs - tzOffsetMinutes * 60 * 1000;
  const utcDate = new Date(utcMs);

  // Calculate Lahiri ayanamsa for this date
  const ayanamsa = getLahiriAyanamsa(utcDate);

  // ---- Calculate tropical longitudes for all planets ----
  const tropicalPositions = {};

  // Sun
  tropicalPositions.sun = getSunLongitude(utcDate);

  // Moon
  tropicalPositions.moon = getMoonLongitude(utcDate);

  // Planets
  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
    tropicalPositions[name.toLowerCase()] = getPlanetLongitude(name, utcDate);
  }

  // Rahu (mean ascending node)
  tropicalPositions.rahu = getMeanLunarNode(utcDate);

  // Ketu (opposite Rahu)
  tropicalPositions.ketu = normalizeDeg(tropicalPositions.rahu + 180);

  // Ascendant (Lagna)
  const ascTropical = calculateAscendant(utcDate, latitude, longitude);

  // ---- Convert to sidereal ----
  const ascSidereal = normalizeDeg(ascTropical - ayanamsa);
  const lagnaSignIndex = getSignIndex(ascSidereal);

  // Build planet data
  const planets = [];
  const planetIds = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

  for (const id of planetIds) {
    const tropLon = tropicalPositions[id];
    const sidLon = normalizeDeg(tropLon - ayanamsa);
    const sign = getSignFromLon(sidLon);
    const signIndex = getSignIndex(sidLon);
    const degInSign = getDegreeInSign(sidLon);
    const nak = getNakshatraFromLon(sidLon);
    const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;
    const retrograde =
      id === 'rahu' || id === 'ketu'
        ? true
        : isRetrograde(id.charAt(0).toUpperCase() + id.slice(1), utcDate);

    planets.push({
      id,
      sign,
      house,
      degree: formatDegree(degInSign),
      nakshatra: nak.name,
      retrograde,
      dignity: getDignity(id, sign),
      _siderealLon: sidLon, // internal use
    });
  }

  // Build 12 houses
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseSignIndex = (lagnaSignIndex + i) % 12;
    const housePlanets = planets
      .filter((p) => p.house === i + 1)
      .map((p) => (p.retrograde ? `${ABBR[p.id]}(R)` : ABBR[p.id]));

    return {
      house: i + 1,
      sign: SIGNS[houseSignIndex],
      planets: housePlanets,
    };
  });

  // Moon data
  const moonPlanet = planets.find((p) => p.id === 'moon');
  const moonSidLon = moonPlanet._siderealLon;
  const moonNak = getNakshatraFromLon(moonSidLon);

  // Lagna nakshatra
  const lagnaNak = getNakshatraFromLon(ascSidereal);

  // Dasha
  const currentDasha = calculateVimshottariDasha(utcDate, moonSidLon);

  // Manglik
  const marsPlanet = planets.find((p) => p.id === 'mars');
  const manglikStatus = checkManglik(marsPlanet.house);

  // Clean internal fields
  const cleanPlanets = planets.map(({ _siderealLon, ...rest }) => rest);

  return {
    ayanamsa: ayanamsa.toFixed(4),
    calculationMethod: 'astronomy-engine (Swiss Ephemeris class) + Lahiri Ayanamsa',
    lagna: {
      sign: getSignFromLon(ascSidereal),
      degree: formatDegree(getDegreeInSign(ascSidereal)),
      nakshatra: lagnaNak.name,
      pada: lagnaNak.pada,
    },
    moonSign: {
      sign: moonPlanet.sign,
      degree: moonPlanet.degree,
      nakshatra: moonNak.name,
      pada: moonNak.pada,
    },
    sunSign: planets.find((p) => p.id === 'sun').sign,
    planets: cleanPlanets,
    houses,
    currentDasha,
    manglikStatus,
  };
}
