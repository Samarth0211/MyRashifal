'use client';

import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

const EXTRA_PERIODS = ['weekly', 'monthly', 'yearly'];

export default function RashifalClientSection({ rashiNameEn, rashiSymbol }) {
  const [period, setPeriod] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPeriod = async (p) => {
    setPeriod(p);
    setData(null);
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/daily-rashifal?rashi=${rashiNameEn}&date=${today}&lang=en&period=${p}`);
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 mb-8">
      <h2 className="font-heading text-lg font-bold text-gold-primary mb-4 text-center">
        {rashiSymbol} {rashiNameEn} Weekly, Monthly & Yearly Horoscope
      </h2>
      <div className="flex justify-center gap-2 mb-6">
        {EXTRA_PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => fetchPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === p
                ? 'bg-gold-primary text-bg-primary font-semibold'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="min-h-[200px] flex items-center justify-center">
          <LoadingScreen message={`Loading ${period} rashifal...`} />
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in">
          {/* Summary */}
          {(data.weekSummary || data.monthSummary || data.yearSummary) && (
            <div className="card-mystical mb-6">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">
                {period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Yearly'} Overview
              </h3>
              <p className="text-text-primary text-sm leading-relaxed">
                {data.weekSummary || data.monthSummary || data.yearSummary}
              </p>
            </div>
          )}

          {/* Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              { title: 'Career', content: data.career, icon: '💼' },
              { title: 'Love', content: data.love, icon: '❤️' },
              { title: 'Health', content: data.health, icon: '🏥' },
              { title: 'Finance', content: data.finance, icon: '💰' },
            ].map((s) => s.content && (
              <div key={s.title} className="card-mystical">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <h3 className="font-heading text-lg font-bold text-gold-primary">{s.title}</h3>
                </div>
                <p className="text-text-primary text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          {data.tip && (
            <div className="highlight-box text-center">
              <p className="text-gold-light text-sm">{data.tip}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
