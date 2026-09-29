'use client';

import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import ShareButtons from '@/components/ShareButtons';
import { PRICING } from '@/lib/constants';
import { savePurchase } from '@/lib/storage';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

const MATCH_TYPES = [
  { id: 'marriage', icon: '💍' },
  { id: 'business', icon: '🤝' },
  { id: 'friendship', icon: '👫' },
];

export default function MatchingPage() {
  const { t, lang } = useLanguage();
  const [matchType, setMatchType] = useState('marriage');
  const [person1Details, setPerson1Details] = useState(null);
  const [person2Details, setPerson2Details] = useState(null);
  const [step, setStep] = useState('person1'); // person1 | person2 | pay | loading | results
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const isMarriage = matchType === 'marriage';

  const p1Label = isMarriage ? t('matching.boy') : t('matching.person1');
  const p2Label = isMarriage ? t('matching.girl') : t('matching.person2');

  const pricingKey = matchType === 'business' ? 'businessMatching' : matchType === 'friendship' ? 'friendshipMatching' : 'matching';
  const price = PRICING[pricingKey]?.price || 79;

  const handlePerson1Submit = (data) => {
    setPerson1Details(data);
    setStep('person2');
  };

  const handlePerson2Submit = (data) => {
    setPerson2Details(data);
    setStep('pay');
  };

  const handlePaymentSuccess = async (paymentId) => {
    savePurchase(pricingKey, paymentId);
    setStep('loading');
    setError('');

    try {
      const body = isMarriage
        ? { boy: person1Details, girl: person2Details, lang, matchType }
        : { person1: person1Details, person2: person2Details, lang, matchType };

      const res = await fetch('/api/kundli-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to match');
      const data = await res.json();
      setResults(data);
      setStep('results');
    } catch {
      setError(t('common.error'));
      setStep('pay');
    }
  };

  const handleReset = () => {
    setPerson1Details(null);
    setPerson2Details(null);
    setResults(null);
    setStep('person1');
    setError('');
  };

  const handleTypeChange = (type) => {
    if (type !== matchType) {
      setMatchType(type);
      handleReset();
    }
  };

  // Marriage-specific helpers
  const getScoreColor = (score) => {
    if (score >= 33) return 'text-gold-light';
    if (score >= 25) return 'text-accent-green';
    if (score >= 18) return 'text-yellow-400';
    return 'text-accent-red';
  };

  const getScoreLabel = (score) => {
    if (score >= 33) return t('matching.excellentMatch');
    if (score >= 25) return t('matching.goodMatch');
    if (score >= 18) return t('matching.averageMatch');
    return t('matching.needsRemedies');
  };

  const getKutaIcon = (scored, max) => {
    const ratio = scored / max;
    if (ratio >= 0.8) return '✅';
    if (ratio >= 0.4) return '⚠️';
    return '❌';
  };

  // Business/friendship score color
  const getGenericScoreColor = (score) => {
    if (score >= 8) return 'text-gold-light';
    if (score >= 6) return 'text-accent-green';
    if (score >= 4) return 'text-yellow-400';
    return 'text-accent-red';
  };

  const stepLabels = [
    isMarriage ? t('matching.boyStep') : t('matching.person1Step'),
    isMarriage ? t('matching.girlStep') : t('matching.person2Step'),
    t('matching.matchStep'),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('matching.title')}
        </h1>
        <p className="text-text-secondary">
          {t('matching.subtitle')}
        </p>
      </div>

      {/* Match Type Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {MATCH_TYPES.map((mt) => (
          <button
            key={mt.id}
            onClick={() => handleTypeChange(mt.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              matchType === mt.id
                ? 'bg-gold-primary text-bg-primary'
                : 'bg-bg-card text-text-secondary border border-border-custom hover:border-gold-primary/50'
            }`}
          >
            {mt.icon} {t(`matching.type_${mt.id}`)}
          </button>
        ))}
      </div>

      <p className="text-gold-light text-sm text-center mb-8">₹{price}</p>

      {/* Progress Indicator */}
      {step !== 'results' && (
        <div className="flex items-center justify-center gap-4 mb-10">
          {stepLabels.map((label, i) => {
            const stepIndex = i === 0 ? 'person1' : i === 1 ? 'person2' : 'pay';
            const isActive = step === stepIndex || (step === 'loading' && i === 2);
            const isComplete =
              (i === 0 && step !== 'person1') ||
              (i === 1 && (step === 'pay' || step === 'loading'));
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isActive
                      ? 'bg-gold-primary text-bg-primary'
                      : isComplete
                      ? 'bg-accent-green/20 text-accent-green border border-accent-green'
                      : 'bg-bg-card text-text-secondary border border-border-custom'
                  }`}
                >
                  {isComplete ? '✓' : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${isActive ? 'text-gold-primary' : 'text-text-secondary'}`}>
                  {label}
                </span>
                {i < 2 && <div className="w-8 sm:w-16 h-px bg-border-custom" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Person 1 Form */}
      {step === 'person1' && (
        <div className="max-w-lg mx-auto animate-fade-in">
          <h2 className="font-heading text-xl font-bold text-center mb-6 text-gold-primary">
            {isMarriage ? t('matching.boyDetails') : t('matching.person1Details')}
          </h2>
          <div className="card-mystical">
            <BirthForm
              onSubmit={handlePerson1Submit}
              label={isMarriage ? t('matching.nextGirl') : t('matching.nextPerson2')}
            />
          </div>
        </div>
      )}

      {/* Person 2 Form */}
      {step === 'person2' && (
        <div className="max-w-lg mx-auto animate-fade-in">
          <button onClick={() => setStep('person1')} className="text-gold-primary text-sm mb-4 hover:underline">
            {isMarriage ? t('matching.backToBoy') : t('matching.backToPerson1')}
          </button>
          <h2 className="font-heading text-xl font-bold text-center mb-6 text-gold-primary">
            {isMarriage ? t('matching.girlDetails') : t('matching.person2Details')}
          </h2>
          <div className="card-mystical">
            <BirthForm
              onSubmit={handlePerson2Submit}
              label={t('matching.proceedMatch')}
            />
          </div>
        </div>
      )}

      {/* Payment */}
      {step === 'pay' && (
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="card-mystical">
            <span className="text-5xl block mb-4">
              {MATCH_TYPES.find((m) => m.id === matchType)?.icon}
            </span>
            <h2 className="font-heading text-xl font-bold mb-2">{t('matching.readyTitle')}</h2>
            <p className="text-text-secondary text-sm mb-2">
              <strong>{person1Details?.name}</strong> & <strong>{person2Details?.name}</strong>
            </p>
            <p className="text-text-secondary text-sm mb-6">
              {t(`matching.readyDesc_${matchType}`)}
            </p>
            {error && (
              <p className="text-accent-red text-sm mb-4">{error}</p>
            )}
            <PaymentButton
              amount={price}
              reportType={pricingKey}
              reportName={PRICING[pricingKey]?.name}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingScreen message={t('matching.performing')} />
        </div>
      )}

      {/* Results */}
      {step === 'results' && results && (
        <div className="animate-fade-in">
          {/* MARRIAGE RESULTS */}
          {matchType === 'marriage' && (
            <>
              {/* Score Circle */}
              <div className="text-center mb-10">
                <div
                  className="score-circle mx-auto mb-4"
                  style={{
                    '--score-percent': `${(results.totalScore / 36) * 100}%`,
                    border: '2px solid var(--border)',
                  }}
                >
                  <span className={`text-4xl font-bold ${getScoreColor(results.totalScore)}`}>
                    {results.totalScore}
                  </span>
                  <span className="text-text-secondary text-sm">/36</span>
                </div>
                <p className={`text-xl font-heading font-bold ${getScoreColor(results.totalScore)}`}>
                  {getScoreLabel(results.totalScore)}
                </p>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.boy')}</p>
                  <p className="font-bold text-gold-light">{results.boy?.name}</p>
                  <p className="text-text-secondary text-xs">{results.boy?.moonSign} | {results.boy?.nakshatra}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.girl')}</p>
                  <p className="font-bold text-gold-light">{results.girl?.name}</p>
                  <p className="text-text-secondary text-xs">{results.girl?.moonSign} | {results.girl?.nakshatra}</p>
                </div>
              </div>

              <InArticleAd className="max-w-4xl mx-auto" />

              {/* 8 Kuta Table */}
              <div className="card-mystical mb-8">
                <h2 className="font-heading text-xl font-bold text-gold-primary mb-4">
                  {t('matching.ashtakootTitle')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-custom">
                        <th className="text-left py-2 px-2 text-gold-primary">{t('matching.kuta')}</th>
                        <th className="text-center py-2 px-2 text-gold-primary">{t('matching.max')}</th>
                        <th className="text-center py-2 px-2 text-gold-primary">{t('matching.scored')}</th>
                        <th className="text-center py-2 px-2 text-gold-primary">{t('matching.result')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.kutas?.map((kuta, i) => (
                        <tr key={i} className="border-b border-border-custom/50">
                          <td className="py-2.5 px-2 font-medium">{kuta.name}</td>
                          <td className="py-2.5 px-2 text-center text-text-secondary">{kuta.maxPoints}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-gold-light">{kuta.scored}</td>
                          <td className="py-2.5 px-2 text-center">{getKutaIcon(kuta.scored, kuta.maxPoints)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gold-primary/50">
                        <td className="py-3 px-2 font-bold text-gold-primary">{t('matching.total')}</td>
                        <td className="py-3 px-2 text-center font-bold text-text-secondary">36</td>
                        <td className="py-3 px-2 text-center font-bold text-gold-light text-lg">{results.totalScore}</td>
                        <td className="py-3 px-2 text-center">{getScoreLabel(results.totalScore)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manglik Status */}
              {results.manglikStatus && (
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className={`card-mystical border-l-4 ${results.manglikStatus.boy?.isManglik ? 'border-l-accent-red' : 'border-l-accent-green'}`}>
                    <p className="text-text-secondary text-xs mb-1">{t('matching.boyManglik')}</p>
                    <p className="font-bold mb-1">
                      {results.manglikStatus.boy?.isManglik ? `⚠️ ${t('matching.manglik')}` : `✅ ${t('matching.nonManglik')}`}
                    </p>
                    <p className="text-text-secondary text-xs">{results.manglikStatus.boy?.details}</p>
                  </div>
                  <div className={`card-mystical border-l-4 ${results.manglikStatus.girl?.isManglik ? 'border-l-accent-red' : 'border-l-accent-green'}`}>
                    <p className="text-text-secondary text-xs mb-1">{t('matching.girlManglik')}</p>
                    <p className="font-bold mb-1">
                      {results.manglikStatus.girl?.isManglik ? `⚠️ ${t('matching.manglik')}` : `✅ ${t('matching.nonManglik')}`}
                    </p>
                    <p className="text-text-secondary text-xs">{results.manglikStatus.girl?.details}</p>
                  </div>
                </div>
              )}

              {/* Compatibility */}
              {results.compatibility && (
                <div className="space-y-4 mb-8">
                  <h2 className="font-heading text-xl font-bold text-gold-primary">{t('matching.compatTitle')}</h2>
                  {[
                    { title: t('matching.mental'), content: results.compatibility.mental, icon: '🧠' },
                    { title: t('matching.physical'), content: results.compatibility.physical, icon: '❤️' },
                    { title: t('matching.financial'), content: results.compatibility.financial, icon: '💰' },
                    { title: t('matching.family'), content: results.compatibility.family, icon: '👨‍👩‍👧‍👦' },
                  ].map((item) => (
                    <div key={item.title} className="report-section">
                      <h3 className="flex items-center gap-2">
                        <span>{item.icon}</span> {item.title}
                      </h3>
                      <p className="text-text-primary text-sm leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* BUSINESS RESULTS */}
          {matchType === 'business' && (
            <>
              <div className="text-center mb-10">
                <div className="w-24 h-24 rounded-full bg-bg-card border-2 border-gold-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className={`text-4xl font-bold ${getGenericScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </span>
                  <span className="text-text-secondary text-sm">/10</span>
                </div>
                <p className={`text-xl font-heading font-bold ${getGenericScoreColor(results.overallScore)}`}>
                  {results.scoreLabel}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.person1')}</p>
                  <p className="font-bold text-gold-light">{results.person1?.name}</p>
                  <p className="text-text-secondary text-xs">{results.person1?.moonSign}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.person2')}</p>
                  <p className="font-bold text-gold-light">{results.person2?.name}</p>
                  <p className="text-text-secondary text-xs">{results.person2?.moonSign}</p>
                </div>
              </div>

              {results.compatibility && (
                <div className="space-y-4 mb-8">
                  <h2 className="font-heading text-xl font-bold text-gold-primary">{t('matching.compatTitle')}</h2>
                  {[
                    { title: t('matching.communication'), content: results.compatibility.communication, icon: '💬' },
                    { title: t('matching.leadership'), content: results.compatibility.leadership, icon: '👑' },
                    { title: t('matching.financial'), content: results.compatibility.financial, icon: '💰' },
                    { title: t('matching.trustReliability'), content: results.compatibility.trustReliability, icon: '🤝' },
                    { title: t('matching.growthPotential'), content: results.compatibility.growthPotential, icon: '📈' },
                  ].map((item) => item.content && (
                    <div key={item.title} className="report-section">
                      <h3 className="flex items-center gap-2">
                        <span>{item.icon}</span> {item.title}
                      </h3>
                      <p className="text-text-primary text-sm leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {results.bestBusinessTypes?.length > 0 && (
                <div className="card-mystical mb-8">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-3">{t('matching.bestBusinessTypes')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.bestBusinessTypes.map((type, i) => (
                      <span key={i} className="text-sm bg-gold-primary/10 text-gold-light px-3 py-1 rounded-full">{type}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {results.strengths?.length > 0 && (
                  <div className="card-mystical border-l-4 border-l-green-500/40">
                    <h3 className="font-heading font-bold text-accent-green mb-2">{t('matching.strengths')}</h3>
                    <ul className="space-y-1">
                      {results.strengths.map((s, i) => (
                        <li key={i} className="text-text-primary text-sm">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.challenges?.length > 0 && (
                  <div className="card-mystical border-l-4 border-l-red-500/40">
                    <h3 className="font-heading font-bold text-accent-red mb-2">{t('matching.challenges')}</h3>
                    <ul className="space-y-1">
                      {results.challenges.map((c, i) => (
                        <li key={i} className="text-text-primary text-sm">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FRIENDSHIP RESULTS */}
          {matchType === 'friendship' && (
            <>
              <div className="text-center mb-10">
                <div className="w-24 h-24 rounded-full bg-bg-card border-2 border-gold-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className={`text-4xl font-bold ${getGenericScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </span>
                  <span className="text-text-secondary text-sm">/10</span>
                </div>
                <p className={`text-xl font-heading font-bold ${getGenericScoreColor(results.overallScore)}`}>
                  {results.scoreLabel}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.person1')}</p>
                  <p className="font-bold text-gold-light">{results.person1?.name}</p>
                  <p className="text-text-secondary text-xs">{results.person1?.moonSign}</p>
                </div>
                <div className="card-mystical text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('matching.person2')}</p>
                  <p className="font-bold text-gold-light">{results.person2?.name}</p>
                  <p className="text-text-secondary text-xs">{results.person2?.moonSign}</p>
                </div>
              </div>

              {results.compatibility && (
                <div className="space-y-4 mb-8">
                  <h2 className="font-heading text-xl font-bold text-gold-primary">{t('matching.compatTitle')}</h2>
                  {[
                    { title: t('matching.emotionalBond'), content: results.compatibility.emotionalBond, icon: '💗' },
                    { title: t('matching.communication'), content: results.compatibility.communication, icon: '💬' },
                    { title: t('matching.sharedInterests'), content: results.compatibility.sharedInterests, icon: '🎯' },
                    { title: t('matching.loyalty'), content: results.compatibility.loyalty, icon: '🛡️' },
                    { title: t('matching.socialLife'), content: results.compatibility.socialLife, icon: '🎉' },
                  ].map((item) => item.content && (
                    <div key={item.title} className="report-section">
                      <h3 className="flex items-center gap-2">
                        <span>{item.icon}</span> {item.title}
                      </h3>
                      <p className="text-text-primary text-sm leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {results.sharedActivities?.length > 0 && (
                <div className="card-mystical mb-8">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-3">{t('matching.sharedActivities')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.sharedActivities.map((act, i) => (
                      <span key={i} className="text-sm bg-gold-primary/10 text-gold-light px-3 py-1 rounded-full">{act}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {results.strengths?.length > 0 && (
                  <div className="card-mystical border-l-4 border-l-green-500/40">
                    <h3 className="font-heading font-bold text-accent-green mb-2">{t('matching.strengths')}</h3>
                    <ul className="space-y-1">
                      {results.strengths.map((s, i) => (
                        <li key={i} className="text-text-primary text-sm">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.challenges?.length > 0 && (
                  <div className="card-mystical border-l-4 border-l-red-500/40">
                    <h3 className="font-heading font-bold text-accent-red mb-2">{t('matching.challenges')}</h3>
                    <ul className="space-y-1">
                      {results.challenges.map((c, i) => (
                        <li key={i} className="text-text-primary text-sm">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* COMMON: Verdict + Advice + Actions */}
          {results.overallVerdict && (
            <div className="highlight-box mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('matching.recommendation')}</h3>
              <p className="text-text-primary text-sm leading-relaxed">{results.overallVerdict}</p>
            </div>
          )}

          {results.advice && (
            <div className="card-mystical mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('matching.advice')}</h3>
              <p className="text-text-primary text-sm leading-relaxed">{results.advice}</p>
            </div>
          )}

          {results.remedies && (
            <div className="card-mystical mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('matching.remedies')}</h3>
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">{results.remedies}</p>
            </div>
          )}

          <div className="mt-8">
            <ShareButtons
              text={`${matchType === 'marriage' ? 'Kundli Matching' : matchType === 'business' ? 'Business Compatibility' : 'Friendship Compatibility'} Result: ${results.totalScore ? results.totalScore + '/36' : results.overallScore + '/10'}\n\n${results.overallVerdict ? results.overallVerdict.slice(0, 150) + '...' : ''}\n\nCheck yours at myrashifal.in`}
            />
          </div>

          <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 no-print">
            <button onClick={() => window.print()} className="btn-outline-gold">
              {t('common.downloadPdf')}
            </button>
            <button onClick={handleReset} className="btn-outline-gold">
              {t('matching.newMatching')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
