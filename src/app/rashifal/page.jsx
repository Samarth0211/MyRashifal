'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import RashiCard from '@/components/RashiCard';
import LoadingScreen from '@/components/LoadingScreen';
import { RASHIS } from '@/lib/constants';
import ShareButtons from '@/components/ShareButtons';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

export default function RashifalPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const [selected, setSelected] = useState(null);
  const [rashifal, setRashifal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('daily');

  const handleSelect = async (rashi, selectedPeriod) => {
    const p = selectedPeriod || period;
    setSelected(rashi);
    setRashifal(null);
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/daily-rashifal?rashi=${rashi.nameEn}&date=${today}&lang=${lang}&period=${p}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRashifal(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (selected) {
      handleSelect(selected, newPeriod);
    }
  };

  const handleBack = () => {
    setSelected(null);
    setRashifal(null);
    setError('');
  };

  const periodLabel = (p) => t(`rashifal.${p}`);

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

      {/* Period Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === p
                ? 'bg-gold-primary text-bg-primary font-semibold'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
            }`}
          >
            {periodLabel(p)}
          </button>
        ))}
      </div>

      {/* Rashi Grid */}
      {!selected && (
        <>
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

          {/* SEO internal links to individual rashi pages */}
          <div className="mt-12 text-center">
            <h2 className="font-heading text-lg font-bold text-gold-primary mb-4">
              {t('rashifal.title')} — {t('rashifal.allSigns')}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {RASHIS.map((rashi) => {
                const hindiSlug = rashi.nameHi.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || rashi.id;
                return (
                  <Link
                    key={rashi.id}
                    href={`/rashifal/${hindiSlug}`}
                    className="text-sm px-3 py-1.5 rounded-full bg-white/[0.06] text-text-secondary hover:text-gold-primary hover:bg-white/[0.1] transition-colors no-underline"
                  >
                    {rashi.symbol} {rashi.nameEn}
                  </Link>
                );
              })}
            </div>
          </div>

          <InArticleAd className="max-w-2xl mx-auto" />
        </>
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
            {t('kundli.tryAgain')}
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
            <p className="text-gold-primary/70 text-sm mt-1 font-medium">{periodLabel(period)} {t('rashifal.horoscope')}</p>
          </div>

          {/* Overall Rating */}
          <div className="text-center mb-8">
            <p className="text-text-secondary text-sm mb-1">{t('rashifal.overallRating')}</p>
            <div className="text-gold-primary text-2xl">
              {'★'.repeat(rashifal.overallRating || 3)}
              {'☆'.repeat(5 - (rashifal.overallRating || 3))}
            </div>
          </div>

          {/* ===== DAILY ===== */}
          {period === 'daily' && (
            <>
              {rashifal.general && (
                <div className="card-mystical mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">☉</span>
                    <h3 className="font-heading text-lg font-bold text-gold-primary">{t('rashifal.general')}</h3>
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed">{rashifal.general}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { title: t('rashifal.career'), content: rashifal.career, icon: '💼' },
                  { title: t('rashifal.love'), content: rashifal.love, icon: '❤️' },
                  { title: t('rashifal.health'), content: rashifal.health, icon: '🏥' },
                  { title: t('rashifal.finance'), content: rashifal.finance, icon: '💰' },
                ].map((section) => (
                  <div key={section.title} className="card-mystical">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="font-heading text-lg font-bold text-gold-primary">{section.title}</h3>
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

              {rashifal.tip && (
                <div className="highlight-box text-center mb-6">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.tipOfDay')}</p>
                  <p className="text-gold-light text-sm">{rashifal.tip}</p>
                </div>
              )}
            </>
          )}

          {/* ===== WEEKLY ===== */}
          {period === 'weekly' && (
            <>
              {rashifal.weekSummary && (
                <div className="card-mystical mb-6">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('rashifal.weeklySummary')}</h3>
                  <p className="text-text-primary text-sm leading-relaxed">{rashifal.weekSummary}</p>
                </div>
              )}

              {rashifal.days && (
                <div className="space-y-3 mb-8">
                  {rashifal.days.map((d) => (
                    <div key={d.day} className={`card-mystical flex items-start gap-3 ${
                      d.day === rashifal.bestDay ? 'border border-green-500/30' :
                      d.day === rashifal.challengingDay ? 'border border-red-500/20' : ''
                    }`}>
                      <span className="text-gold-primary font-heading font-bold text-sm min-w-[80px]">{d.day}</span>
                      <p className="text-text-primary text-sm leading-relaxed">{d.highlight}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { title: t('rashifal.career'), content: rashifal.career, icon: '💼' },
                  { title: t('rashifal.love'), content: rashifal.love, icon: '❤️' },
                  { title: t('rashifal.health'), content: rashifal.health, icon: '🏥' },
                  { title: t('rashifal.finance'), content: rashifal.finance, icon: '💰' },
                ].map((section) => (
                  <div key={section.title} className="card-mystical">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="font-heading text-lg font-bold text-gold-primary">{section.title}</h3>
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card-mystical text-center border border-green-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.bestDay')}</p>
                  <p className="text-green-400 font-bold">{rashifal.bestDay}</p>
                </div>
                <div className="card-mystical text-center border border-red-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.challengingDay')}</p>
                  <p className="text-red-400 font-bold">{rashifal.challengingDay}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyNumber')}</p>
                  <p className="text-gold-light text-2xl font-bold">{rashifal.luckyNumber}</p>
                </div>
              </div>

              {rashifal.tip && (
                <div className="highlight-box text-center mb-6">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.weeklyTip')}</p>
                  <p className="text-gold-light text-sm">{rashifal.tip}</p>
                </div>
              )}
            </>
          )}

          {/* ===== MONTHLY ===== */}
          {period === 'monthly' && (
            <>
              {rashifal.monthSummary && (
                <div className="card-mystical mb-6">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('rashifal.monthlySummary')}</h3>
                  <p className="text-text-primary text-sm leading-relaxed">{rashifal.monthSummary}</p>
                </div>
              )}

              {rashifal.weeks && (
                <div className="space-y-3 mb-8">
                  {rashifal.weeks.map((w, i) => (
                    <div key={i} className="card-mystical">
                      <p className="text-gold-primary font-heading font-bold text-sm mb-1">{w.week}</p>
                      <p className="text-text-primary text-sm leading-relaxed">{w.prediction}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { title: t('rashifal.career'), content: rashifal.career, icon: '💼' },
                  { title: t('rashifal.love'), content: rashifal.love, icon: '❤️' },
                  { title: t('rashifal.health'), content: rashifal.health, icon: '🏥' },
                  { title: t('rashifal.finance'), content: rashifal.finance, icon: '💰' },
                ].map((section) => (
                  <div key={section.title} className="card-mystical">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="font-heading text-lg font-bold text-gold-primary">{section.title}</h3>
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card-mystical text-center border border-green-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.bestDates')}</p>
                  <p className="text-green-400 font-bold text-sm">{rashifal.bestDates}</p>
                </div>
                <div className="card-mystical text-center border border-red-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.challengingDates')}</p>
                  <p className="text-red-400 font-bold text-sm">{rashifal.challengingDates}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyColor')}</p>
                  <p className="text-gold-light font-bold">{rashifal.luckyColor}</p>
                </div>
              </div>

              {rashifal.tip && (
                <div className="highlight-box text-center mb-6">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.monthlyTip')}</p>
                  <p className="text-gold-light text-sm">{rashifal.tip}</p>
                </div>
              )}
            </>
          )}

          {/* ===== YEARLY ===== */}
          {period === 'yearly' && (
            <>
              {rashifal.yearSummary && (
                <div className="card-mystical mb-6">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('rashifal.yearlySummary')}</h3>
                  <p className="text-text-primary text-sm leading-relaxed">{rashifal.yearSummary}</p>
                </div>
              )}

              {rashifal.majorTransits && (
                <div className="highlight-box mb-6">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.majorTransits')}</p>
                  <p className="text-gold-light text-sm">{rashifal.majorTransits}</p>
                </div>
              )}

              {rashifal.quarters && (
                <div className="space-y-3 mb-8">
                  {rashifal.quarters.map((q, i) => (
                    <div key={i} className="card-mystical">
                      <p className="text-gold-primary font-heading font-bold text-sm mb-1">{q.quarter}</p>
                      <p className="text-text-primary text-sm leading-relaxed">{q.prediction}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { title: t('rashifal.career'), content: rashifal.career, icon: '💼' },
                  { title: t('rashifal.love'), content: rashifal.love, icon: '❤️' },
                  { title: t('rashifal.health'), content: rashifal.health, icon: '🏥' },
                  { title: t('rashifal.finance'), content: rashifal.finance, icon: '💰' },
                ].map((section) => (
                  <div key={section.title} className="card-mystical">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="font-heading text-lg font-bold text-gold-primary">{section.title}</h3>
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card-mystical text-center border border-green-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.bestMonths')}</p>
                  <p className="text-green-400 font-bold text-sm">{rashifal.bestMonths}</p>
                </div>
                <div className="card-mystical text-center border border-red-500/20">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.challengingMonths')}</p>
                  <p className="text-red-400 font-bold text-sm">{rashifal.challengingMonths}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyColor')}</p>
                  <p className="text-gold-light font-bold">{rashifal.luckyColor}</p>
                </div>
              </div>

              {rashifal.tip && (
                <div className="highlight-box text-center mb-6">
                  <p className="text-text-secondary text-xs mb-1">{t('rashifal.yearlyTip')}</p>
                  <p className="text-gold-light text-sm">{rashifal.tip}</p>
                </div>
              )}
            </>
          )}

          {/* Share Buttons */}
          <div className="mt-6">
            <ShareButtons
              text={`${selected.nameEn} ${periodLabel(period)} Rashifal\n\n${rashifal.general || rashifal.weekSummary || rashifal.monthSummary || rashifal.yearSummary || ''}\n\nGet yours free at myrashifal.in`}
            />
          </div>

          {/* Ad — after rashifal content */}
          <AdBanner format="auto" className="max-w-2xl mx-auto mt-4" />

          {/* Sign-in prompt for anonymous users */}
          {!session?.user && (
            <div className="mt-8 rounded-xl border border-gold-primary/20 bg-gold-primary/5 p-5 sm:p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-gold-light mb-2">
                {t('rashifal.signInBanner.title')}
              </h3>
              <p className="text-text-secondary text-sm mb-4 max-w-md mx-auto">
                {t('rashifal.signInBanner.desc')}
              </p>
              <button
                onClick={() => signIn('google')}
                className="btn-gold text-sm px-6 py-2.5 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('rashifal.signInBanner.cta')}
              </button>
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
