'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGS } from '@/translations';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-bg-card/50 border border-border-custom rounded-lg p-0.5">
      {SUPPORTED_LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-2 sm:px-2 sm:py-1 rounded text-sm sm:text-xs font-medium transition-all min-w-[44px] ${
            lang === l.code
              ? 'bg-gold-primary/20 text-gold-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          title={l.nativeLabel}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
