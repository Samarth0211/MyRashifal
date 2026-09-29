'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORIES = [
  { value: 'general', labelKey: 'feedback.catGeneral' },
  { value: 'bug', labelKey: 'feedback.catBug' },
  { value: 'feature', labelKey: 'feedback.catFeature' },
  { value: 'accuracy', labelKey: 'feedback.catAccuracy' },
];

export default function FeedbackPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'general',
    rating: 0,
    message: '',
  });
  const [step, setStep] = useState('form'); // form | submitting | success
  const [error, setError] = useState('');

  // Pre-fill email from session
  const email = form.email || session?.user?.email || '';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.message.trim()) {
      setError(t('feedback.errorEmpty'));
      return;
    }

    setStep('submitting');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || session?.user?.name || 'Anonymous',
          email: email,
          category: form.category,
          rating: form.rating,
          message: form.message.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setStep('success');
    } catch (err) {
      setError(err.message || t('feedback.errorGeneric'));
      setStep('form');
    }
  };

  // Star rating component
  const StarRating = () => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setForm({ ...form, rating: star })}
          className={`text-2xl transition-transform hover:scale-125 ${
            star <= form.rating ? 'text-gold-light' : 'text-white/20'
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
      {form.rating > 0 && (
        <span className="text-text-secondary text-sm self-center ml-2">
          {form.rating}/5
        </span>
      )}
    </div>
  );

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card-mystical p-8 sm:p-12 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-heading font-bold mb-3 text-gold-light">
            {t('feedback.thankYou')}
          </h2>
          <p className="text-text-secondary mb-8">
            {t('feedback.thankYouDesc')}
          </p>
          <button
            onClick={() => {
              setForm({ name: '', email: '', category: 'general', rating: 0, message: '' });
              setStep('form');
            }}
            className="btn-outline-gold px-6 py-2"
          >
            {t('feedback.submitAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('feedback.title')}{' '}
          <span className="text-gold-gradient">{t('feedback.titleHighlight')}</span>
        </h1>
        <p className="text-text-secondary">
          {t('feedback.subtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-mystical p-6 sm:p-8 space-y-6">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1.5">
              {t('feedback.name')}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={session?.user?.name || t('feedback.namePlaceholder')}
              className="input-mystical"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1.5">
              {t('feedback.email')}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={session?.user?.email || t('feedback.emailPlaceholder')}
              className="input-mystical"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-text-secondary text-sm mb-1.5">
            {t('feedback.category')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  form.category === cat.value
                    ? 'bg-gold-primary/20 text-gold-light border border-gold-primary/40'
                    : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-text-secondary text-sm mb-1.5">
            {t('feedback.rating')}
          </label>
          <StarRating />
        </div>

        {/* Message */}
        <div>
          <label className="block text-text-secondary text-sm mb-1.5">
            {t('feedback.message')} <span className="text-red-400">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={t('feedback.messagePlaceholder')}
            rows={5}
            className="input-mystical resize-none"
            required
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={step === 'submitting'}
          className="btn-gold w-full py-3 text-base font-semibold"
        >
          {step === 'submitting' ? t('feedback.submitting') : t('feedback.submit')}
        </button>

        <p className="text-text-secondary/50 text-xs text-center">
          {t('feedback.privacyNote')}
        </p>
      </form>
    </div>
  );
}
