'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FestivalBanner() {
  const { t, lang } = useLanguage();
  const [offer, setOffer] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetch('/api/festival-offer')
      .then((r) => r.json())
      .then((data) => {
        if (data.active) setOffer(data);
      })
      .catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!offer?.endsAt) return;
    const tick = () => {
      const diff = new Date(offer.endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [offer]);

  if (!offer) return null;

  const festivalName = lang === 'mr' ? offer.festivalMr
    : lang === 'hi' ? offer.festivalHi
    : offer.festival;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-primary/40 bg-gradient-to-r from-gold-primary/15 via-bg-card to-gold-primary/10 p-5 sm:p-6 mb-8">
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-4 text-2xl opacity-60">✨</div>
      <div className="absolute bottom-2 left-4 text-xl opacity-40">🪔</div>

      <div className="text-center relative z-10">
        <p className="text-gold-primary font-bold text-lg sm:text-xl mb-1">
          {t('festival.happyFestival', { festival: festivalName })}
        </p>
        <p className="text-gold-light text-2xl sm:text-3xl font-heading font-bold mb-2">
          {t('festival.discount', { percent: offer.discount })}
        </p>
        {timeLeft && (
          <p className="text-text-secondary text-sm mb-3">
            {t('festival.endsIn', { time: timeLeft })}
          </p>
        )}
        <Link href="/reports" className="inline-block btn-gold no-underline text-sm px-6 py-2">
          {t('festival.shopNow')}
        </Link>
      </div>
    </div>
  );
}
