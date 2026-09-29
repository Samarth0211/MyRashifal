'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export default function PushNotificationPrompt() {
  const { data: session } = useSession();
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // success | error | ''

  useEffect(() => {
    // Check if already subscribed
    if (typeof window !== 'undefined' && localStorage.getItem('myrashifal_push_subscribed')) {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!selectedRashi) return;

    setLoading(true);
    setStatus('');

    try {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('error');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('error');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setStatus('error');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Send to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          rashi: selectedRashi,
          lang,
          userId: session?.user?.id || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      localStorage.setItem('myrashifal_push_subscribed', 'true');
      localStorage.setItem('myrashifal_push_rashi', selectedRashi);
      setIsSubscribed(true);
      setStatus('success');

      // Auto-close after 2s
      setTimeout(() => setIsOpen(false), 2000);
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      localStorage.removeItem('myrashifal_push_subscribed');
      localStorage.removeItem('myrashifal_push_rashi');
      setIsSubscribed(false);
      setStatus('');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no browser support
  if (typeof window !== 'undefined' && (!('serviceWorker' in navigator) || !('PushManager' in window))) {
    return null;
  }

  return (
    <>
      {/* Bell FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gold-primary text-bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label={t('push.title')}
        >
          {isSubscribed ? '🔔' : '🔕'}
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 card-mystical shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading font-bold text-gold-primary text-sm">
              {t('push.title')}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary text-lg"
            >
              ✕
            </button>
          </div>

          {isSubscribed ? (
            <div>
              <p className="text-text-secondary text-xs mb-3">
                {t('push.alreadySubscribed')} ({localStorage.getItem('myrashifal_push_rashi')})
              </p>
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="text-xs text-accent-red hover:underline"
              >
                {loading ? '...' : t('push.unsubscribe')}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-text-secondary text-xs mb-3">{t('push.desc')}</p>

              <select
                value={selectedRashi}
                onChange={(e) => setSelectedRashi(e.target.value)}
                className="w-full bg-bg-primary text-text-primary border border-border-custom rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option value="">{t('push.selectRashi')}</option>
                {RASHIS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <button
                onClick={handleSubscribe}
                disabled={!selectedRashi || loading}
                className="btn-gold w-full text-sm py-2 disabled:opacity-50"
              >
                {loading ? '...' : t('push.subscribe')}
              </button>

              {status === 'success' && (
                <p className="text-accent-green text-xs mt-2">{t('push.success')}</p>
              )}
              {status === 'error' && (
                <p className="text-accent-red text-xs mt-2">{t('push.error')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
