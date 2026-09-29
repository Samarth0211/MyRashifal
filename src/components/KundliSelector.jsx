'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function KundliSelector({ kundlis, selectedId, onSelect, onAddNew }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = kundlis.find((k) => k.kundliId === selectedId) || kundlis[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!kundlis || kundlis.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-block w-full max-w-sm">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-bg-card border border-white/[0.08] rounded-xl px-4 py-3 text-left hover:border-gold-primary/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary text-sm font-bold flex-shrink-0">
          {(selected?.label || selected?.birthDetails?.name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-text-primary text-sm font-medium truncate">
            {selected?.label || selected?.birthDetails?.name}
            {selected?.isPrimary && (
              <span className="ml-1.5 text-[10px] text-gold-primary bg-gold-primary/10 px-1.5 py-0.5 rounded-full">
                {t('selector.primary')}
              </span>
            )}
          </p>
          <p className="text-text-secondary text-xs truncate">
            {selected?.birthDetails?.dob} &middot; {selected?.birthDetails?.pob}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-bg-primary/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in max-h-72 overflow-y-auto">
          {kundlis.map((k) => {
            const isSelected = k.kundliId === selectedId;
            return (
              <button
                key={k.kundliId}
                onClick={() => {
                  onSelect(k.kundliId);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                  isSelected
                    ? 'bg-gold-primary/10 text-gold-light'
                    : 'text-text-primary hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isSelected ? 'bg-gold-primary/20 text-gold-primary' : 'bg-white/[0.06] text-text-secondary'
                }`}>
                  {(k.label || k.birthDetails?.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">
                    {k.label || k.birthDetails?.name}
                    {k.isPrimary && (
                      <span className="ml-1.5 text-[10px] text-gold-primary bg-gold-primary/10 px-1.5 py-0.5 rounded-full">
                        {t('selector.primary')}
                      </span>
                    )}
                  </p>
                  <p className="text-text-secondary text-xs truncate">
                    {k.birthDetails?.dob} &middot; {k.birthDetails?.pob}
                  </p>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 text-gold-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Add New */}
          {onAddNew && (
            <>
              <div className="border-t border-white/[0.06] my-1" />
              <button
                onClick={() => {
                  onAddNew();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gold-primary hover:bg-gold-primary/5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{t('selector.addNew')}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
