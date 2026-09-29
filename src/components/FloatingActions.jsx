'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const ACTIONS = [
  {
    key: 'astrologer',
    href: '/astrologers',
    labelKey: 'fab.talkAstrologer',
    bg: 'bg-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: 'rashifal',
    href: '/rashifal',
    labelKey: 'fab.rashifal',
    bg: 'bg-blue-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    key: 'kundli',
    href: '/kundli',
    labelKey: 'fab.freeKundli',
    bg: 'bg-gold-primary',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    key: 'whatsapp',
    href: null,
    labelKey: 'fab.share',
    bg: 'bg-[#25D366]',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function FloatingActions() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleAction = (action) => {
    if (action.key === 'whatsapp') {
      const msg = `MyRashifal+ - Free Vedic Kundli & Daily Rashifal\n\nGenerate your free birth chart, get daily horoscope & talk to astrologers.\n\nhttps://myrashifal.in`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-3">
      {/* Action buttons */}
      {open && (
        <div className="flex flex-col gap-2.5 animate-fade-in">
          {ACTIONS.map((action, i) => {
            const label = t(action.labelKey);
            const content = (
              <div
                className="flex items-center gap-2"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-xs font-medium text-text-primary bg-bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/[0.08] shadow-lg whitespace-nowrap">
                  {label}
                </span>
                <span className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center text-white shadow-lg`}>
                  {action.icon}
                </span>
              </div>
            );

            if (action.href) {
              return (
                <Link
                  key={action.key}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="no-underline"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={action.key} onClick={() => handleAction(action)}>
                {content}
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full bg-gold-primary shadow-lg shadow-gold-primary/30 flex items-center justify-center text-bg-primary transition-all hover:brightness-110 hover:shadow-gold-primary/50 ${
          open ? 'rotate-45' : ''
        }`}
        aria-label="Quick actions"
      >
        <svg className="w-7 h-7 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
