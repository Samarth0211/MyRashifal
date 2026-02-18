'use client';

import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import { PRICING } from '@/lib/constants';
import { savePurchase } from '@/lib/storage';

export default function MatchingPage() {
  const [boyDetails, setBoyDetails] = useState(null);
  const [girlDetails, setGirlDetails] = useState(null);
  const [step, setStep] = useState('boy'); // boy | girl | pay | loading | results
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleBoySubmit = (data) => {
    setBoyDetails(data);
    setStep('girl');
  };

  const handleGirlSubmit = (data) => {
    setGirlDetails(data);
    setStep('pay');
  };

  const handlePaymentSuccess = async (paymentId) => {
    savePurchase('matching', paymentId);
    setStep('loading');
    setError('');

    try {
      const res = await fetch('/api/kundli-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boy: boyDetails, girl: girlDetails }),
      });
      if (!res.ok) throw new Error('Failed to match');
      const data = await res.json();
      setResults(data);
      setStep('results');
    } catch {
      setError('The cosmic signals are temporarily disrupted. Please try again.');
      setStep('pay');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 33) return 'text-gold-light';
    if (score >= 25) return 'text-accent-green';
    if (score >= 18) return 'text-yellow-400';
    return 'text-accent-red';
  };

  const getScoreLabel = (score) => {
    if (score >= 33) return 'Excellent Match';
    if (score >= 25) return 'Good Match';
    if (score >= 18) return 'Average Match';
    return 'Needs Remedies';
  };

  const getKutaIcon = (scored, max) => {
    const ratio = scored / max;
    if (ratio >= 0.8) return '✅';
    if (ratio >= 0.4) return '⚠️';
    return '❌';
  };

  const handleReset = () => {
    setBoyDetails(null);
    setGirlDetails(null);
    setResults(null);
    setStep('boy');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          Kundli <span className="text-gold-gradient">Matching</span>
        </h1>
        <p className="text-text-secondary">
          Ashtakoot Gun Milan — Complete compatibility analysis
        </p>
        <p className="text-gold-light text-sm mt-1">₹{PRICING.matching.price}</p>
      </div>

      {/* Progress Indicator */}
      {step !== 'results' && (
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Boy Details', 'Girl Details', 'Match'].map((label, i) => {
            const stepIndex = i === 0 ? 'boy' : i === 1 ? 'girl' : 'pay';
            const isActive = step === stepIndex || (step === 'loading' && i === 2);
            const isComplete =
              (i === 0 && step !== 'boy') ||
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

      {/* Boy Form */}
      {step === 'boy' && (
        <div className="max-w-lg mx-auto animate-fade-in">
          <h2 className="font-heading text-xl font-bold text-center mb-6 text-gold-primary">
            Boy&apos;s Birth Details
          </h2>
          <div className="card-mystical">
            <BirthForm
              onSubmit={handleBoySubmit}
              label="Next → Girl's Details"
            />
          </div>
        </div>
      )}

      {/* Girl Form */}
      {step === 'girl' && (
        <div className="max-w-lg mx-auto animate-fade-in">
          <button onClick={() => setStep('boy')} className="text-gold-primary text-sm mb-4 hover:underline">
            ← Back to boy&apos;s details
          </button>
          <h2 className="font-heading text-xl font-bold text-center mb-6 text-gold-primary">
            Girl&apos;s Birth Details
          </h2>
          <div className="card-mystical">
            <BirthForm
              onSubmit={handleGirlSubmit}
              label="Proceed to Match ✨"
            />
          </div>
        </div>
      )}

      {/* Payment */}
      {step === 'pay' && (
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="card-mystical">
            <span className="text-5xl block mb-4">💍</span>
            <h2 className="font-heading text-xl font-bold mb-2">Ready to Match</h2>
            <p className="text-text-secondary text-sm mb-2">
              <strong>{boyDetails?.name}</strong> & <strong>{girlDetails?.name}</strong>
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Get complete Ashtakoot Gun Milan with 36-point analysis, Manglik check, and detailed compatibility report.
            </p>
            {error && (
              <p className="text-accent-red text-sm mb-4">{error}</p>
            )}
            <PaymentButton
              amount={PRICING.matching.price}
              reportType="matching"
              reportName="Kundli Matching - Gun Milan"
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingScreen message="Performing Ashtakoot Gun Milan..." />
        </div>
      )}

      {/* Results */}
      {step === 'results' && results && (
        <div className="animate-fade-in">
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
              <p className="text-text-secondary text-xs mb-1">Boy</p>
              <p className="font-bold text-gold-light">{results.boy?.name}</p>
              <p className="text-text-secondary text-xs">{results.boy?.moonSign} | {results.boy?.nakshatra}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Girl</p>
              <p className="font-bold text-gold-light">{results.girl?.name}</p>
              <p className="text-text-secondary text-xs">{results.girl?.moonSign} | {results.girl?.nakshatra}</p>
            </div>
          </div>

          {/* 8 Kuta Table */}
          <div className="card-mystical mb-8">
            <h2 className="font-heading text-xl font-bold text-gold-primary mb-4">
              Ashtakoot Gun Milan
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left py-2 px-2 text-gold-primary">Kuta</th>
                    <th className="text-center py-2 px-2 text-gold-primary">Max</th>
                    <th className="text-center py-2 px-2 text-gold-primary">Scored</th>
                    <th className="text-center py-2 px-2 text-gold-primary">Result</th>
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
                    <td className="py-3 px-2 font-bold text-gold-primary">Total</td>
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
                <p className="text-text-secondary text-xs mb-1">Boy - Manglik Status</p>
                <p className="font-bold mb-1">
                  {results.manglikStatus.boy?.isManglik ? '⚠️ Manglik' : '✅ Non-Manglik'}
                </p>
                <p className="text-text-secondary text-xs">{results.manglikStatus.boy?.details}</p>
              </div>
              <div className={`card-mystical border-l-4 ${results.manglikStatus.girl?.isManglik ? 'border-l-accent-red' : 'border-l-accent-green'}`}>
                <p className="text-text-secondary text-xs mb-1">Girl - Manglik Status</p>
                <p className="font-bold mb-1">
                  {results.manglikStatus.girl?.isManglik ? '⚠️ Manglik' : '✅ Non-Manglik'}
                </p>
                <p className="text-text-secondary text-xs">{results.manglikStatus.girl?.details}</p>
              </div>
            </div>
          )}

          {/* Compatibility */}
          {results.compatibility && (
            <div className="space-y-4 mb-8">
              <h2 className="font-heading text-xl font-bold text-gold-primary">Compatibility Analysis</h2>
              {[
                { title: 'Mental Compatibility', content: results.compatibility.mental, icon: '🧠' },
                { title: 'Physical Compatibility', content: results.compatibility.physical, icon: '❤️' },
                { title: 'Financial Compatibility', content: results.compatibility.financial, icon: '💰' },
                { title: 'Family Compatibility', content: results.compatibility.family, icon: '👨‍👩‍👧‍👦' },
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

          {/* Overall Verdict */}
          {results.overallVerdict && (
            <div className="highlight-box mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">Overall Recommendation</h3>
              <p className="text-text-primary text-sm leading-relaxed">{results.overallVerdict}</p>
            </div>
          )}

          {/* Remedies */}
          {results.remedies && (
            <div className="card-mystical mb-8">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">Remedies</h3>
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">{results.remedies}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 no-print">
            <button onClick={() => window.print()} className="btn-outline-gold">
              Download as PDF
            </button>
            <button onClick={handleReset} className="btn-outline-gold">
              New Matching
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
