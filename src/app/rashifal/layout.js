export const metadata = {
  title: 'Daily Rashifal | Today\'s Horoscope for All Zodiac Signs',
  description:
    'Read today\'s Rashifal (daily horoscope) for all 12 zodiac signs - Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius & Pisces. Free daily predictions in English, Hindi & Marathi.',
  keywords: 'rashifal, daily rashifal, aaj ka rashifal, today horoscope, rashifal in hindi, daily horoscope, zodiac predictions, rashi bhavishya',
  alternates: { canonical: 'https://myrashifal.in/rashifal' },
  openGraph: {
    title: 'Daily Rashifal - Today\'s Horoscope | MyRashifal+',
    description: 'Free daily Rashifal for all 12 zodiac signs. Personalized Vedic astrology predictions.',
    url: 'https://myrashifal.in/rashifal',
  },
};

export default function RashifalLayout({ children }) {
  return children;
}
