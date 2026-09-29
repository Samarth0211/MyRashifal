'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewsletterSignup() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', dob: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [rashi, setRashi] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.dob) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      });
      const data = await res.json();
      if (data.success) {
        setRashi(data.rashi);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card-mystical text-center py-6">
        <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-bold text-text-primary mb-1">
          {t('newsletter.successTitle')}
        </h3>
        <p className="text-text-secondary text-sm mb-2">
          {t('newsletter.successDesc')}
        </p>
        <p className="text-gold-light text-sm font-medium">
          {t('newsletter.yourRashi')}: {rashi}
        </p>
      </div>
    );
  }

  return (
    <div className="card-mystical">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-text-primary leading-tight">
            {t('newsletter.title')}
          </h3>
          <p className="text-text-secondary text-xs mt-0.5">
            {t('newsletter.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t('newsletter.namePlaceholder')}
          required
          className="input-mystical text-sm"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t('newsletter.emailPlaceholder')}
          required
          className="input-mystical text-sm"
        />
        <input
          type="date"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
          required
          className="input-mystical text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-gold w-full text-sm"
        >
          {status === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-accent-red text-xs mt-2 text-center">{t('newsletter.error')}</p>
      )}

      <p className="text-text-secondary/50 text-[10px] text-center mt-3">
        {t('newsletter.privacy')}
      </p>
    </div>
  );
}
