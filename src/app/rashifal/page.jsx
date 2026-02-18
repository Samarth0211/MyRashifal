'use client';

import { useState } from 'react';
import Link from 'next/link';
import RashiCard from '@/components/RashiCard';
import LoadingScreen from '@/components/LoadingScreen';
import { RASHIS } from '@/lib/constants';

export default function RashifalPage() {
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
      const res = await fetch(`/api/daily-rashifal?rashi=${rashi.nameEn}&date=${today}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRashifal(data);
    } catch {
      setError('The cosmic signals are temporarily disrupted. Please try again.');
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
          Daily <span className="text-gold-gradient">Rashifal</span>
        </h1>
        <p className="text-text-secondary">
          Select your Rashi for today&apos;s personalized prediction
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
          <LoadingScreen message={`Reading ${selected?.nameEn} horoscope...`} />
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
            ← Back to all signs
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
            <p className="text-text-secondary text-sm mb-1">Today&apos;s Rating</p>
            <div className="text-gold-primary text-2xl">
              {'★'.repeat(rashifal.overallRating || 3)}
              {'☆'.repeat(5 - (rashifal.overallRating || 3))}
            </div>
          </div>

          {/* Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { title: 'General', content: rashifal.general, icon: '☉' },
              { title: 'Career', content: rashifal.career, icon: '💼' },
              { title: 'Love & Relationships', content: rashifal.love, icon: '❤️' },
              { title: 'Health', content: rashifal.health, icon: '🏥' },
              { title: 'Finance', content: rashifal.finance, icon: '💰' },
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
              <p className="text-text-secondary text-xs mb-1">Lucky Number</p>
              <p className="text-gold-light text-2xl font-bold">{rashifal.luckyNumber}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Lucky Color</p>
              <p className="text-gold-light text-lg font-bold">{rashifal.luckyColor}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Lucky Time</p>
              <p className="text-gold-light text-sm font-bold">{rashifal.luckyTime}</p>
            </div>
          </div>

          {/* Tip */}
          {rashifal.tip && (
            <div className="highlight-box text-center">
              <p className="text-text-secondary text-xs mb-1">Tip of the Day</p>
              <p className="text-gold-light text-sm">{rashifal.tip}</p>
            </div>
          )}

          {/* Upsell */}
          <div className="text-center mt-10 p-6 card-mystical">
            <p className="text-text-secondary text-sm mb-3">
              This is your Sun sign rashifal. Get personalized transit-based predictions based on your exact birth chart.
            </p>
            <Link href="/kundli" className="btn-gold no-underline inline-block">
              Generate Your Kundli — Free
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
