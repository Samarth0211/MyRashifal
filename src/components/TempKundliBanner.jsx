'use client';

import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TempKundliBanner({ kundli, isAuthenticated, onSave, onDiscard, saving }) {
  const { t } = useLanguage();
  const bd = kundli?.birthDetails;

  return (
    <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
      <div className="bg-bg-card border border-gold-primary/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-primary/5 rounded-full blur-2xl pointer-events-none" />

        {/* Kundli summary */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4 relative">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold-primary/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            <svg className="w-6 h-6 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-base sm:text-lg text-gold-light">
              {t('tempKundli.found').replace('{name}', bd?.name || 'Unknown')}
            </h3>
            <p className="text-text-secondary text-xs sm:text-sm mt-1 truncate">
              {bd?.dob} &middot; {bd?.tob} &middot; {bd?.pob}
            </p>
            {kundli?.lagna && (
              <p className="text-text-secondary/70 text-xs mt-0.5">
                {t('tempKundli.lagna')}: {kundli.lagna.sign} &middot; {t('tempKundli.moonSign')}: {kundli.moonSign?.sign}
              </p>
            )}
          </div>
        </div>

        {/* Info message */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 mb-5 relative">
          <p className="text-text-secondary text-xs leading-relaxed">
            {isAuthenticated ? t('tempKundli.savePrompt') : t('tempKundli.signInPrompt')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 relative">
          {isAuthenticated ? (
            <>
              <button
                onClick={onSave}
                disabled={saving}
                className="btn-gold flex-1 text-center text-sm py-3 font-semibold"
              >
                {saving ? t('tempKundli.saving') : t('tempKundli.saveAndContinue')}
              </button>
              <button
                onClick={onDiscard}
                className="btn-outline-gold flex-1 text-center text-sm py-3"
              >
                {t('tempKundli.discard')}
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/reports' })}
              className="btn-gold w-full flex items-center justify-center gap-2.5 text-sm py-3 font-semibold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('tempKundli.signInWithGoogle')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
