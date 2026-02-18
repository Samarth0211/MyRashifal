import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import TestModeBadge from '@/components/TestModeBadge';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'MyRashifal+ | Personalized Vedic Astrology & Kundli',
  description:
    'Get your detailed Vedic Kundli, personalized Rashifal, Kundli matching, and premium astrology reports. Based on Brihat Parashara Hora Shastra.',
  keywords:
    'kundli, rashifal, vedic astrology, horoscope, gun milan, kundli matching, jyotish, birth chart, janam kundli',
  openGraph: {
    title: 'MyRashifal+ | Your Stars, Your Story',
    description:
      'Premium personalized Vedic astrology. Free Kundli generation, daily Rashifal, and detailed life reports.',
    type: 'website',
  },
};

function StarsBackground() {
  // Generate deterministic star positions using a seed pattern
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${(i * 17.3 + 5) % 100}%`,
    top: `${(i * 23.7 + 3) % 100}%`,
    size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
    animClass:
      i % 3 === 0
        ? 'animate-twinkle'
        : i % 3 === 1
        ? 'animate-twinkle-delayed'
        : 'animate-twinkle-slow',
  }));

  return (
    <div className="stars-bg" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className={`star ${s.animClass}`}
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <AuthProvider>
          <LanguageProvider>
            <StarsBackground />
            <Navbar />
            <main className="flex-1 pt-16 relative z-10">{children}</main>
            <Footer />
            <TestModeBadge />
          </LanguageProvider>
        </AuthProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
