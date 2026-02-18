export const RASHIS = [
  { id: "aries", nameEn: "Aries", nameHi: "मेष (Mesh)", nameMr: "मेष (Mesh)", symbol: "♈", element: "Fire", ruler: "Mars", dateRange: "Mar 21 - Apr 19" },
  { id: "taurus", nameEn: "Taurus", nameHi: "वृषभ (Vrishabh)", nameMr: "वृषभ (Vrushabh)", symbol: "♉", element: "Earth", ruler: "Venus", dateRange: "Apr 20 - May 20" },
  { id: "gemini", nameEn: "Gemini", nameHi: "मिथुन (Mithun)", nameMr: "मिथुन (Mithun)", symbol: "♊", element: "Air", ruler: "Mercury", dateRange: "May 21 - Jun 20" },
  { id: "cancer", nameEn: "Cancer", nameHi: "कर्क (Kark)", nameMr: "कर्क (Kark)", symbol: "♋", element: "Water", ruler: "Moon", dateRange: "Jun 21 - Jul 22" },
  { id: "leo", nameEn: "Leo", nameHi: "सिंह (Singh)", nameMr: "सिंह (Sinh)", symbol: "♌", element: "Fire", ruler: "Sun", dateRange: "Jul 23 - Aug 22" },
  { id: "virgo", nameEn: "Virgo", nameHi: "कन्या (Kanya)", nameMr: "कन्या (Kanya)", symbol: "♍", element: "Earth", ruler: "Mercury", dateRange: "Aug 23 - Sep 22" },
  { id: "libra", nameEn: "Libra", nameHi: "तुला (Tula)", nameMr: "तूळ (Tula)", symbol: "♎", element: "Air", ruler: "Venus", dateRange: "Sep 23 - Oct 22" },
  { id: "scorpio", nameEn: "Scorpio", nameHi: "वृश्चिक (Vrishchik)", nameMr: "वृश्चिक (Vrushchik)", symbol: "♏", element: "Water", ruler: "Mars", dateRange: "Oct 23 - Nov 21" },
  { id: "sagittarius", nameEn: "Sagittarius", nameHi: "धनु (Dhanu)", nameMr: "धनु (Dhanu)", symbol: "♐", element: "Fire", ruler: "Jupiter", dateRange: "Nov 22 - Dec 21" },
  { id: "capricorn", nameEn: "Capricorn", nameHi: "मकर (Makar)", nameMr: "मकर (Makar)", symbol: "♑", element: "Earth", ruler: "Saturn", dateRange: "Dec 22 - Jan 19" },
  { id: "aquarius", nameEn: "Aquarius", nameHi: "कुम्भ (Kumbh)", nameMr: "कुंभ (Kumbh)", symbol: "♒", element: "Air", ruler: "Saturn", dateRange: "Jan 20 - Feb 18" },
  { id: "pisces", nameEn: "Pisces", nameHi: "मीन (Meen)", nameMr: "मीन (Meen)", symbol: "♓", element: "Water", ruler: "Jupiter", dateRange: "Feb 19 - Mar 20" },
];

export const PLANETS = [
  { id: "sun", nameEn: "Sun", nameHi: "सूर्य", nameMr: "सूर्य", abbr: "Su", symbol: "☉" },
  { id: "moon", nameEn: "Moon", nameHi: "चंद्र", nameMr: "चंद्र", abbr: "Mo", symbol: "☽" },
  { id: "mars", nameEn: "Mars", nameHi: "मंगल", nameMr: "मंगळ", abbr: "Ma", symbol: "♂" },
  { id: "mercury", nameEn: "Mercury", nameHi: "बुध", nameMr: "बुध", abbr: "Me", symbol: "☿" },
  { id: "jupiter", nameEn: "Jupiter", nameHi: "गुरु", nameMr: "गुरू", abbr: "Ju", symbol: "♃" },
  { id: "venus", nameEn: "Venus", nameHi: "शुक्र", nameMr: "शुक्र", abbr: "Ve", symbol: "♀" },
  { id: "saturn", nameEn: "Saturn", nameHi: "शनि", nameMr: "शनी", abbr: "Sa", symbol: "♄" },
  { id: "rahu", nameEn: "Rahu", nameHi: "राहु", nameMr: "राहू", abbr: "Ra", symbol: "☊" },
  { id: "ketu", nameEn: "Ketu", nameHi: "केतु", nameMr: "केतू", abbr: "Ke", symbol: "☋" },
];

export const PRICING = {
  career: { name: "Career & Wealth Report", price: 49, icon: "💼" },
  marriage: { name: "Marriage & Relationship Report", price: 79, icon: "💑" },
  health: { name: "Health & Wellness Report", price: 49, icon: "🏥" },
  varshphal: { name: "Annual Varshphal Report", price: 149, icon: "📅" },
  education: { name: "Education & Exam Report", price: 49, icon: "📚" },
  complete: { name: "Complete Life Report Bundle", price: 299, originalPrice: 466, icon: "✨" },
  matching: { name: "Kundli Matching", price: 79, icon: "💍" },
  muhurat: { name: "Shubh Muhurat", price: 29, icon: "🕐" },
  question: { name: "Ask a Question", price: 29, icon: "❓" },
  subscription: { name: "Premium Monthly", price: 199, icon: "👑" },
};

export const LOADING_MESSAGES = [
  "Consulting the stars...",
  "Aligning your planets...",
  "Reading your cosmic blueprint...",
  "Calculating planetary positions...",
  "Analyzing your Nakshatra...",
  "Decoding your Dasha periods...",
  "Interpreting celestial patterns...",
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const LANG_KEY_MAP = { en: 'nameEn', hi: 'nameHi', mr: 'nameMr' };

export function getRashiName(rashi, lang = 'en') {
  const key = LANG_KEY_MAP[lang] || 'nameEn';
  const found = RASHIS.find(r => r.id === rashi || r.nameEn === rashi);
  return found ? (found[key] || found.nameEn) : rashi;
}

export function getPlanetName(planet, lang = 'en') {
  const key = LANG_KEY_MAP[lang] || 'nameEn';
  const found = PLANETS.find(p => p.id === planet || p.nameEn === planet);
  return found ? (found[key] || found.nameEn) : planet;
}
