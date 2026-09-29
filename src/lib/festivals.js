// Indian Festival Calendar for automated offers
// Dates are approximate and should be updated yearly

const FESTIVALS = [
  // 2026
  { name: 'Maha Shivaratri', nameHi: 'महा शिवरात्रि', nameMr: 'महाशिवरात्री', date: '2026-02-27', discount: 25 },
  { name: 'Holi', nameHi: 'होली', nameMr: 'होळी', date: '2026-03-14', discount: 30 },
  { name: 'Ugadi', nameHi: 'उगादी', nameMr: 'गुढीपाडवा', date: '2026-03-19', discount: 25 },
  { name: 'Ram Navami', nameHi: 'राम नवमी', nameMr: 'राम नवमी', date: '2026-04-03', discount: 20 },
  { name: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया', nameMr: 'अक्षय्य तृतीया', date: '2026-05-01', discount: 30 },
  { name: 'Guru Purnima', nameHi: 'गुरु पूर्णिमा', nameMr: 'गुरू पौर्णिमा', date: '2026-07-11', discount: 25 },
  { name: 'Raksha Bandhan', nameHi: 'रक्षा बंधन', nameMr: 'रक्षाबंधन', date: '2026-08-09', discount: 20 },
  { name: 'Janmashtami', nameHi: 'जन्माष्टमी', nameMr: 'गोकुळाष्टमी', date: '2026-08-22', discount: 25 },
  { name: 'Ganesh Chaturthi', nameHi: 'गणेश चतुर्थी', nameMr: 'गणेश चतुर्थी', date: '2026-09-01', discount: 30 },
  { name: 'Navratri', nameHi: 'नवरात्रि', nameMr: 'नवरात्री', date: '2026-09-22', discount: 25 },
  { name: 'Dussehra', nameHi: 'दशहरा', nameMr: 'दसरा', date: '2026-10-02', discount: 25 },
  { name: 'Diwali', nameHi: 'दीवाली', nameMr: 'दिवाळी', date: '2026-10-21', discount: 30 },
  // 2027
  { name: 'Makar Sankranti', nameHi: 'मकर संक्रांति', nameMr: 'मकर संक्रांती', date: '2027-01-14', discount: 20 },
  { name: 'Maha Shivaratri', nameHi: 'महा शिवरात्रि', nameMr: 'महाशिवरात्री', date: '2027-02-16', discount: 25 },
  { name: 'Holi', nameHi: 'होली', nameMr: 'होळी', date: '2027-03-04', discount: 30 },
  { name: 'Ugadi', nameHi: 'उगादी', nameMr: 'गुढीपाडवा', date: '2027-03-09', discount: 25 },
  { name: 'Ram Navami', nameHi: 'राम नवमी', nameMr: 'राम नवमी', date: '2027-03-23', discount: 20 },
  { name: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया', nameMr: 'अक्षय्य तृतीया', date: '2027-04-20', discount: 30 },
  { name: 'Guru Purnima', nameHi: 'गुरु पूर्णिमा', nameMr: 'गुरू पौर्णिमा', date: '2027-07-01', discount: 25 },
  { name: 'Ganesh Chaturthi', nameHi: 'गणेश चतुर्थी', nameMr: 'गणेश चतुर्थी', date: '2027-08-22', discount: 30 },
  { name: 'Navratri', nameHi: 'नवरात्रि', nameMr: 'नवरात्री', date: '2027-10-11', discount: 25 },
  { name: 'Dussehra', nameHi: 'दशहरा', nameMr: 'दसरा', date: '2027-10-20', discount: 25 },
  { name: 'Diwali', nameHi: 'दीवाली', nameMr: 'दिवाळी', date: '2027-11-08', discount: 30 },
];

const OFFER_START_DAYS_BEFORE = 2;
const OFFER_END_DAYS_AFTER = 1;

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00+05:30');
  const d2 = new Date(dateStr2 + 'T00:00:00+05:30');
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0];
}

/**
 * Returns the currently active festival offer, if any.
 * Offer window: 2 days before festival → 1 day after festival.
 */
export function getActiveFestivalOffer() {
  const today = getTodayIST();

  for (const festival of FESTIVALS) {
    const daysToFestival = daysBetween(today, festival.date);
    // Active if we're within the offer window
    if (daysToFestival >= -OFFER_END_DAYS_AFTER && daysToFestival <= OFFER_START_DAYS_BEFORE) {
      const endDate = new Date(festival.date + 'T23:59:59+05:30');
      endDate.setDate(endDate.getDate() + OFFER_END_DAYS_AFTER);

      return {
        active: true,
        festival: festival.name,
        festivalHi: festival.nameHi,
        festivalMr: festival.nameMr,
        discount: festival.discount,
        festivalDate: festival.date,
        endsAt: endDate.toISOString(),
        daysToFestival,
      };
    }
  }

  return { active: false };
}

/**
 * Returns a festival that starts within `daysAhead` days (for cron email triggers).
 */
export function getUpcomingFestival(daysAhead = 2) {
  const today = getTodayIST();

  for (const festival of FESTIVALS) {
    const days = daysBetween(today, festival.date);
    if (days >= 0 && days <= daysAhead) {
      return { ...festival, daysUntil: days };
    }
  }

  return null;
}

/**
 * Returns a festival happening today (for "Happy Festival!" emails).
 */
export function getTodayFestival() {
  const today = getTodayIST();
  return FESTIVALS.find((f) => f.date === today) || null;
}

export function getFestivalName(offer, lang) {
  if (lang === 'mr') return offer.festivalMr || offer.nameMr || offer.festival;
  if (lang === 'hi') return offer.festivalHi || offer.nameHi || offer.festival;
  return offer.festival || offer.name;
}
