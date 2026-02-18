'use client';

import { useState } from 'react';
import Link from 'next/link';
import RashiCard from '@/components/RashiCard';
import LoadingScreen from '@/components/LoadingScreen';
import { RASHIS } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RashifalPage() {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [rashifal, setRashifal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = async (rashi) => {
    setSelected(rashi);
    setRashifal(null);
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/daily-rashifal?rashi=${rashi.nameEn}&date=${today}&lang=${lang}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRashifal(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelected(null);
    setRashifal(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('rashifal.title')}
        </h1>
        <p className="text-text-secondary">
          {t('rashifal.subtitle')}
        </p>
        <p className="text-text-secondary text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Rashi Grid */}
      {!selected && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {RASHIS.map((rashi) => (
            <RashiCard
              key={rashi.id}
              rashi={rashi}
              onClick={handleSelect}
              selected={false}
            />
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingScreen message={t('rashifal.reading', { name: selected?.nameEn })} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-accent-red mb-4">{error}</p>
          <button onClick={() => handleSelect(selected)} className="btn-gold">
            Try Again
          </button>
        </div>
      )}

      {/* Rashifal Display */}
      {selected && rashifal && !loading && (
        <div className="animate-fade-in">
          <button onClick={handleBack} className="text-gold-primary text-sm mb-6 hover:underline">
            {t('rashifal.backToAll')}
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-6xl block mb-3">{selected.symbol}</span>
            <h2 className="font-heading text-3xl font-bold text-gold-gradient">
              {selected.nameEn}
            </h2>
            <p className="text-text-secondary font-hindi">{selected.nameHi}</p>
          </div>

          {/* Overall Rating */}
          <div className="text-center mb-8">
            <p className="text-text-secondary text-sm mb-1">{t('rashifal.todaysRating')}</p>
            <div className="text-gold-primary text-2xl">
              {'★'.repeat(rashifal.overallRating || 3)}
              {'☆'.repeat(5 - (rashifal.overallRating || 3))}
            </div>
          </div>

          {/* Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { title: t('rashifal.general'), content: rashifal.general, icon: '☉' },
              { title: t('rashifal.career'), content: rashifal.career, icon: '💼' },
              { title: t('rashifal.love'), content: rashifal.love, icon: '❤️' },
              { title: t('rashifal.health'), content: rashifal.health, icon: '🏥' },
              { title: t('rashifal.finance'), content: rashifal.finance, icon: '💰' },
            ].map((section) => (
              <div key={section.title} className="card-mystical">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="font-heading text-lg font-bold text-gold-primary">
                    {section.title}
                  </h3>
                </div>
                <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Lucky Section */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyNumber')}</p>
              <p className="text-gold-light text-2xl font-bold">{rashifal.luckyNumber}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyColor')}</p>
              <p className="text-gold-light text-lg font-bold">{rashifal.luckyColor}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyTime')}</p>
              <p className="text-gold-light text-sm font-bold">{rashifal.luckyTime}</p>
            </div>
          </div>

          {/* Tip */}
          {rashifal.tip && (
            <div className="highlight-box text-center">
              <p className="text-text-secondary text-xs mb-1">{t('rashifal.tipOfDay')}</p>
              <p className="text-gold-light text-sm">{rashifal.tip}</p>
            </div>
          )}

          {/* Upsell */}
          <div className="text-center mt-10 p-6 card-mystical">
            <p className="text-text-secondary text-sm mb-3">
              {t('rashifal.upsellText')}
            </p>
            <Link href="/kundli" className="btn-gold no-underline inline-block">
              {t('rashifal.upsellCta')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
