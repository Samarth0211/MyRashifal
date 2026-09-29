'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGUAGES = [
  { code: 'en', native: 'English', desc: 'Continue in English' },
  { code: 'hi', native: 'हिन्दी', desc: 'हिंदी में जारी रखें' },
  { code: 'mr', native: 'मराठी', desc: 'मराठीत सुरू ठेवा' },
];

export default function LanguageSelectionModal() {
  const { setLang } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('myrashifal_lang');
    if (!saved) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#0c1030] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
        {/* Decorative glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Welcome text */}
        <div className="text-center mb-6 relative">
          <div className="text-3xl mb-3">🪷</div>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-1">
            Welcome to MyRashifal+
          </h2>
          <p className="text-text-secondary text-sm">
            Choose your preferred language
          </p>
          <p className="text-text-secondary/60 text-xs mt-1">
            अपनी भाषा चुनें · तुमची भाषा निवडा
          </p>
        </div>

        {/* Language buttons */}
        <div className="space-y-3 relative">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-gold-primary/10 hover:border-gold-primary/30 transition-all group"
            >
              <span className="text-2xl font-bold text-gold-light group-hover:scale-110 transition-transform w-10 text-center">
                {l.code === 'en' ? 'A' : l.code === 'hi' ? 'अ' : 'अ'}
              </span>
              <div className="text-left">
                <div className="text-text-primary font-semibold text-base">
                  {l.native}
                </div>
                <div className="text-text-secondary text-xs">
                  {l.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
