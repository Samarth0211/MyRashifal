'use client';

import { useState, useEffect } from 'react';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllCities } from '@/lib/cities';

const POPULAR_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

export default function PanchangPage() {
  const { t } = useLanguage();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [city, setCity] = useState('Delhi');
  const [panchang, setPanchang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const allCities = getAllCities();

  const filteredCities = citySearch
    ? allCities.filter(
        (c) =>
          c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
          c.state.toLowerCase().includes(citySearch.toLowerCase())
      ).slice(0, 10)
    : [];

  useEffect(() => {
    fetchPanchang();
  }, [date, city]);

  const fetchPanchang = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/panchang?date=${date}&city=${city}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPanchang(data);
    } catch {
      setPanchang(null);
    } finally {
      setLoading(false);
    }
  };

  const selectCity = (c) => {
    setCity(c.name);
    setCitySearch('');
    setShowCityDropdown(false);
  };

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('panchang.title')}
        </h1>
        <p className="text-text-secondary">{t('panchang.subtitle')}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <div>
          <label className="block text-xs text-text-secondary mb-1">{t('panchang.selectDate')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
          />
        </div>
        <div className="relative">
          <label className="block text-xs text-text-secondary mb-1">{t('panchang.selectCity')}</label>
          <input
            type="text"
            value={showCityDropdown ? citySearch : city}
            onFocus={() => {
              setShowCityDropdown(true);
              setCitySearch('');
            }}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder={t('panchang.searchCity')}
            className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40 w-56"
          />
          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-bg-primary/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-20">
              {!citySearch && POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => selectCity({ name: c })}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/[0.04] transition-all ${
                    city === c ? 'text-gold-light' : 'text-text-secondary'
                  }`}
                >
                  {c}
                </button>
              ))}
              {citySearch && filteredCities.map((c) => (
                <button
                  key={c.name}
                  onClick={() => selectCity(c)}
                  className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/[0.04] transition-all"
                >
                  {c.name}, {c.state}
                </button>
              ))}
              {citySearch && filteredCities.length === 0 && (
                <p className="px-4 py-2 text-xs text-text-secondary">{t('panchang.noResults')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick City Pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {POPULAR_CITIES.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => { setCity(c); setShowCityDropdown(false); }}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              city === c
                ? 'bg-gold-primary text-bg-primary font-semibold'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Panchang Data */}
      {panchang && !loading && (
        <div className="animate-fade-in">
          {/* Date & City Header */}
          <div className="text-center mb-8">
            <p className="text-gold-light font-heading text-lg font-bold">{displayDate}</p>
            <p className="text-text-secondary text-sm">
              {panchang.city?.name}{panchang.city?.state ? `, ${panchang.city.state}` : ''}
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {/* Tithi */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.tithi')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.tithi.name}</p>
              <p className="text-text-secondary text-xs">
                {panchang.tithi.paksha} {t('panchang.paksha')} — {panchang.tithi.number}
              </p>
            </div>

            {/* Nakshatra */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.nakshatra')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.nakshatra.name}</p>
              <p className="text-text-secondary text-xs">
                {t('panchang.lord')}: {panchang.nakshatra.lord} | {t('kundli.pada')}: {panchang.nakshatra.pada}
              </p>
            </div>

            {/* Yoga */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.yoga')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.yoga}</p>
            </div>

            {/* Karana */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.karana')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.karana}</p>
            </div>

            {/* Sun Sign */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.sunSign')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.sunSign}</p>
            </div>

            {/* Moon Sign */}
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.moonSign')}</p>
              <p className="text-gold-light font-bold text-lg">{panchang.moonSign}</p>
            </div>
          </div>

          <InArticleAd className="max-w-4xl mx-auto" />

          {/* Sunrise, Sunset, Rahu Kaal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.sunrise')}</p>
              <p className="text-gold-light font-bold text-xl">{panchang.sunrise || '—'}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.sunset')}</p>
              <p className="text-gold-light font-bold text-xl">{panchang.sunset || '—'}</p>
            </div>
            <div className="card-mystical text-center border border-red-500/20">
              <p className="text-text-secondary text-xs mb-1">{t('panchang.rahuKaal')}</p>
              <p className="text-red-400 font-bold text-lg">
                {panchang.rahuKaal ? `${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}` : '—'}
              </p>
              <p className="text-red-400/60 text-xs">{t('panchang.rahuKaalNote')}</p>
            </div>
          </div>

          <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

          {/* Info Note */}
          <div className="text-text-secondary text-xs text-center max-w-2xl mx-auto leading-relaxed">
            {t('panchang.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
}
