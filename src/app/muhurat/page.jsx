'use client';

import { useState } from 'react';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import { PRICING } from '@/lib/constants';
import { savePurchase } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';

const EVENT_KEYS = [
  'muhurat.eventMarriage',
  'muhurat.eventGrihaPravesh',
  'muhurat.eventBusiness',
  'muhurat.eventVehicle',
  'muhurat.eventMundan',
  'muhurat.eventNaming',
  'muhurat.eventProperty',
  'muhurat.eventTravel',
  'muhurat.eventGold',
  'muhurat.eventEducation',
];

export default function MuhuratPage() {
  const { t, lang } = useLanguage();
  const [eventType, setEventType] = useState('');
  const [dateRange, setDateRange] = useState(30);
  const [step, setStep] = useState('form'); // form | pay | loading | results
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const getEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + dateRange);
    return d.toISOString().split('T')[0];
  };

  const handlePaymentSuccess = async (paymentId) => {
    savePurchase(`muhurat_${eventType}`, paymentId);
    setStep('loading');
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/muhurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          startDate: today,
          endDate: getEndDate(),
          lang,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResults(data);
      setStep('results');
    } catch {
      setError('The cosmic signals are temporarily disrupted. Please try again.');
      setStep('pay');
    }
  };

  const handleReset = () => {
    setEventType('');
    setResults(null);
    setStep('form');
    setError('');
  };

  const renderStars = (count) => '⭐'.repeat(count);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('muhurat.title')}
        </h1>
        <p className="text-text-secondary">
          {t('muhurat.subtitle')}
        </p>
        <p className="text-gold-light text-sm mt-1">₹{PRICING.muhurat.price}</p>
      </div>

      {/* Form */}
      {step === 'form' && (
        <div className="max-w-lg mx-auto animate-fade-in">
          <div className="card-mystical space-y-5">
            {/* Event Type */}
            <div>
              <label className="block text-text-secondary text-sm mb-1">{t('muhurat.eventType')}</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="input-mystical"
              >
                <option value="" disabled>{t('muhurat.selectEvent')}</option>
                {EVENT_KEYS.map((key) => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('muhurat.dateRange')}</label>
              <div className="flex gap-3">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDateRange(days)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      dateRange === days
                        ? 'bg-gold-primary/20 border border-gold-primary text-gold-primary'
                        : 'bg-bg-card border border-border-custom text-text-secondary hover:border-gold-primary/50'
                    }`}
                  >
                    {t(`muhurat.next${days}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={() => setStep('pay')}
              disabled={!eventType}
              className="btn-gold w-full"
            >
              {t('muhurat.findMuhurat')}
            </button>
          </div>
        </div>
      )}

      {/* Payment */}
      {step === 'pay' && (
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="card-mystical">
            <span className="text-5xl block mb-4">🕐</span>
            <h2 className="font-heading text-xl font-bold mb-2">{t('muhurat.findTitle')}</h2>
            <p className="text-text-secondary text-sm mb-2">
              <strong>{eventType}</strong>
            </p>
            <p className="text-text-secondary text-sm mb-6">
              {t('common.nextDaysFrom', { days: dateRange })}
            </p>
            {error && <p className="text-accent-red text-sm mb-4">{error}</p>}
            <PaymentButton
              amount={PRICING.muhurat.price}
              reportType="muhurat"
              reportName={`Shubh Muhurat - ${eventType}`}
              onPaymentSuccess={handlePaymentSuccess}
            />
            <button
              onClick={() => setStep('form')}
              className="text-gold-primary text-sm mt-4 hover:underline block mx-auto"
            >
              {t('muhurat.changeSelection')}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingScreen message={t('muhurat.searching')} />
        </div>
      )}

      {/* Results */}
      {step === 'results' && results && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-gold-gradient mb-2">
              {t('muhurat.resultsTitle', { event: results.eventType || eventType })}
            </h2>
            <p className="text-text-secondary text-sm">
              {t('muhurat.sorted')}
            </p>
          </div>

          {/* Muhurat Cards */}
          <div className="space-y-4 mb-8">
            {results.muhurats?.map((muhurat, i) => (
              <div key={i} className="card-mystical flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Date Badge */}
                <div className="sm:w-24 text-center">
                  <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-lg p-3">
                    <p className="text-gold-light font-bold text-lg">
                      {new Date(muhurat.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })}
                    </p>
                    <p className="text-gold-primary text-xs">
                      {new Date(muhurat.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-text-primary">
                      {muhurat.day}
                    </h3>
                    <span className="text-sm">{renderStars(muhurat.rating || 3)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-text-secondary mb-2">
                    <span>{t('muhurat.tithi')}: {muhurat.tithi}</span>
                    <span>Nakshatra: {muhurat.nakshatra}</span>
                  </div>
                  <div className="bg-accent-green/10 border border-accent-green/20 rounded px-3 py-1.5 inline-block mb-2">
                    <span className="text-accent-green text-sm font-medium">
                      🕐 {muhurat.timeWindow}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">{muhurat.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* General Advice */}
          {results.generalAdvice && (
            <div className="highlight-box mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('muhurat.generalAdvice')}</h3>
              <p className="text-text-primary text-sm leading-relaxed">{results.generalAdvice}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 no-print">
            <button onClick={() => window.print()} className="btn-outline-gold">
              {t('common.downloadPdf')}
            </button>
            <button onClick={handleReset} className="btn-outline-gold">
              {t('muhurat.findAnother')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
