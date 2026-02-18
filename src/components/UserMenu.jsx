'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserMenu() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-bg-card animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="text-sm font-semibold text-text-primary hover:text-gold-primary transition-colors px-3 py-1.5 border border-[#2a2a5e] rounded-lg hover:border-gold-primary"
      >
        {t('auth.signIn')}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full border-2 border-gold-primary"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gold-primary flex items-center justify-center text-bg-primary font-bold text-sm">
            {session.user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-[#2a2a5e] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a5e]">
            <p className="text-sm font-semibold text-text-primary truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left px-4 py-3 text-sm text-text-secondary hover:text-accent-red hover:bg-bg-primary/50 transition-colors cursor-pointer"
          >
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
