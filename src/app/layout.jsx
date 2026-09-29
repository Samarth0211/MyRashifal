import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import TestModeBadge from '@/components/TestModeBadge';
import FloatingActions from '@/components/FloatingActions';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';
import LanguageSelectionModal from '@/components/LanguageSelectionModal';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';
import './redesign.css';

export const metadata = {
  metadataBase: new URL('https://myrashifal.in'),
  title: {
    default: 'MyRashifal+ | Free Vedic Kundli & Daily Rashifal Online',
    template: '%s | MyRashifal+',
  },
  description:
    'Generate your free Vedic Kundli (birth chart) online using real astronomical data. Get daily Rashifal, Kundli matching (Gun Milan), Nakshatra analysis, Vimshottari Dasha & AI-powered astrology reports.',
  keywords:
    'kundli, rashifal, vedic astrology, free kundli online, janam kundli, horoscope, gun milan, kundli matching, jyotish, birth chart, nakshatra, dasha, rashifal today, daily horoscope hindi, kundli software free, rashifal in hindi, aaj ka rashifal',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-512.png',
  },
  openGraph: {
    title: 'MyRashifal+ | Free Vedic Kundli & Daily Rashifal',
    description:
      'Free Vedic birth chart generator powered by real astronomical data. Daily Rashifal, Kundli matching, Nakshatra analysis & AI astrology reports.',
    type: 'website',
    url: 'https://myrashifal.in',
    siteName: 'MyRashifal+',
    locale: 'en_IN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyRashifal+ - Free Vedic Kundli & Daily Rashifal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRashifal+ | Free Vedic Kundli & Daily Rashifal',
    description:
      'Generate your free Vedic Kundli online. Daily Rashifal, Kundli matching & AI astrology reports.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://myrashifal.in',
    languages: {
      'en': 'https://myrashifal.in',
      'hi': 'https://myrashifal.in',
      'mr': 'https://myrashifal.in',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

function StarsBackground() {
  // Generate deterministic star positions using a seed pattern — more stars, varied sizes
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: `${(i * 13.7 + 7) % 100}%`,
    top: `${(i * 19.3 + 2) % 100}%`,
    size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
    opacity: i % 4 === 0 ? 0.6 : i % 3 === 0 ? 0.4 : 0.2,
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
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

// JSON-LD structured data for Google rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://myrashifal.in/#website',
      url: 'https://myrashifal.in',
      name: 'MyRashifal+',
      description: 'Free Vedic Kundli generator and daily Rashifal powered by real astronomical data.',
      inLanguage: ['en', 'hi', 'mr'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://myrashifal.in/rashifal?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://myrashifal.in/#organization',
      name: 'MyRashifal+',
      url: 'https://myrashifal.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myrashifal.in/icon-512.png',
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MyRashifal+',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense — must be in <head> for crawler verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8134913049399970"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        <AuthProvider>
          <LanguageProvider>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Navbar />
            <main id="main-content" className="site-main flex-1 relative z-10">{children}</main>
            <Footer />
            <TestModeBadge />
          </LanguageProvider>
        </AuthProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        {process.env.NODE_ENV === 'production' && <Script id="sw-register" strategy="lazyOnload">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}
        </Script>}
      </body>
    </html>
  );
}

export const viewport = { themeColor: '#F9F7F2', width: 'device-width', initialScale: 1 };
