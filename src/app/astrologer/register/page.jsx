'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPECIALIZATIONS } from '@/lib/constants';

export default function AstrologerRegisterPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    experience: '',
    specializations: [],
    languages: ['en'],
    bio: '',
    pricePerSession: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">{t('astrologer.registerTitle')}</h1>
        <p className="text-text-secondary mb-6">{t('astrologer.loginFirst')}</p>
        <button onClick={() => signIn('google')} className="btn-gold">
          {t('common.signInGoogle')}
        </button>
      </div>
    );
  }

  const toggleSpec = (spec) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleLang = (lang) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const sendOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/astrologer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send verification code');
        return;
      }
      setOtpSent(true);
      setMaskedEmail(data.maskedEmail || '');
      setResendTimer(30);
    } catch {
      setOtpError('Failed to send verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/astrologer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setOtpError(data.error || 'Invalid code');
        return;
      }
      setEmailVerified(true);
    } catch {
      setOtpError('Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      setError(t('astrologer.phoneNotVerified'));
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/astrologer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phoneVerified: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-heading font-bold text-gold-primary mb-4">
          {t('astrologer.registrationSuccess')}
        </h1>
        <p className="text-text-secondary">
          {t('astrologer.pendingApproval')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-2">
        {t('astrologer.registerTitle')}
      </h1>
      <p className="text-text-secondary text-center mb-8">
        {t('astrologer.registerSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="card-mystical p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">{t('astrologer.fullName')}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
          />
        </div>

        {/* Email Verification */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">{t('astrologer.verifyEmail')}</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-text-secondary text-sm">
              {session.user.email}
            </div>
            {!emailVerified && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading}
                className="px-4 py-2 rounded-lg bg-gold-primary/20 text-gold-primary text-sm font-semibold hover:bg-gold-primary/30 transition-all disabled:opacity-40 whitespace-nowrap"
              >
                {otpLoading && !otpSent ? t('common.loading') : t('astrologer.sendOtp')}
              </button>
            )}
            {emailVerified && (
              <span className="flex items-center text-green-400 text-sm font-semibold px-3 gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('astrologer.verified')}
              </span>
            )}
          </div>

          {/* OTP input row */}
          {otpSent && !emailVerified && (
            <>
              {maskedEmail && (
                <p className="text-text-secondary text-xs mt-2">
                  Code sent to {maskedEmail}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40 tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading || otpValue.length !== 6}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/30 transition-all disabled:opacity-40"
                >
                  {otpLoading ? t('common.loading') : t('astrologer.verifyOtp')}
                </button>
              </div>
            </>
          )}

          {/* Resend link */}
          {otpSent && !emailVerified && (
            <div className="mt-1">
              {resendTimer > 0 ? (
                <p className="text-text-secondary text-xs">
                  {t('astrologer.resendIn', { seconds: resendTimer })}
                </p>
              ) : (
                <button type="button" onClick={sendOtp} className="text-gold-primary text-xs hover:underline">
                  {t('astrologer.resendOtp')}
                </button>
              )}
            </div>
          )}

          {otpError && <p className="text-accent-red text-xs mt-1">{otpError}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">{t('astrologer.phone')}</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">{t('astrologer.experience')}</label>
          <input
            type="number"
            required
            min={1}
            max={50}
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            placeholder="5"
            className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
          />
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('astrologer.specializations')}</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  form.specializations.includes(spec)
                    ? 'bg-gold-primary text-bg-primary font-semibold'
                    : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t('astrologer.languages')}</label>
          <div className="flex gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'Hindi' },
              { code: 'mr', label: 'Marathi' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => toggleLang(l.code)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  form.languages.includes(l.code)
                    ? 'bg-gold-primary text-bg-primary font-semibold'
                    : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">{t('astrologer.bio')}</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={500}
            placeholder={t('astrologer.bioPlaceholder')}
            className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t('astrologer.pricePerSession')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
            <input
              type="number"
              required
              min={10}
              max={10000}
              value={form.pricePerSession}
              onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })}
              placeholder="99"
              className="w-full pl-8 pr-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
            />
          </div>
          <p className="text-text-secondary text-xs mt-1">{t('astrologer.priceNote')}</p>
        </div>

        {error && (
          <p className="text-accent-red text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || form.specializations.length === 0 || !emailVerified}
          className="btn-gold w-full disabled:opacity-40"
        >
          {submitting ? t('common.loading') : t('astrologer.submitRegistration')}
        </button>
      </form>
    </div>
  );
}
