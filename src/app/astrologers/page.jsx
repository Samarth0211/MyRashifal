'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AstrologerCard from '@/components/AstrologerCard';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPECIALIZATIONS } from '@/lib/constants';

export default function AstrologersPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetch('/api/astrologers')
      .then((res) => res.json())
      .then((data) => setAstrologers(data.astrologers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all'
      ? astrologers
      : astrologers.filter((a) => a.specializations?.includes(filter));

  const handleChatNow = async (astrologer) => {
    if (!session) {
      signIn('google');
      return;
    }

    setPaying(astrologer._id);
    try {
      // Create chat session + Razorpay order
      const res = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ astrologerId: astrologer._id }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create session');
        return;
      }

      const { sessionId, orderId, amount, astrologerName } = await res.json();

      // Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'MyRashifal+',
        description: `Chat with ${astrologerName} (2 min)`,
        order_id: orderId,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch('/api/chat/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              sessionId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            router.push(`/chat/${sessionId}`);
          } else {
            alert(t('payment.verifyFailed'));
          }
        },
        theme: { color: '#d4a017' },
        modal: { ondismiss: () => setPaying(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert(t('payment.failed'));
        setPaying(null);
      });
      rzp.open();
    } catch (error) {
      console.error('Chat payment error:', error);
      alert(t('payment.error'));
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('marketplace.title')}
        </h1>
        <p className="text-text-secondary">{t('marketplace.subtitle')}</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            filter === 'all'
              ? 'bg-gold-primary text-bg-primary font-semibold'
              : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
          }`}
        >
          {t('marketplace.all')}
        </button>
        {SPECIALIZATIONS.map((spec) => (
          <button
            key={spec}
            onClick={() => setFilter(spec)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              filter === spec
                ? 'bg-gold-primary text-bg-primary font-semibold'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      <InArticleAd className="max-w-6xl mx-auto" />

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-text-secondary mt-4">{t('common.loading')}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">{t('marketplace.noAstrologers')}</p>
          <p className="text-text-secondary text-sm mt-2">{t('marketplace.checkLater')}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <AstrologerCard
              key={a._id}
              astrologer={a}
              onChatNow={handleChatNow}
            />
          ))}
        </div>
      )}

      <AdBanner format="auto" className="max-w-6xl mx-auto mt-4" />

      {/* Become an astrologer CTA */}
      <div className="text-center mt-16 p-6 card-mystical">
        <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">
          {t('marketplace.becomeAstrologer')}
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          {t('marketplace.becomeDesc')}
        </p>
        <button
          onClick={() => router.push('/astrologer/register')}
          className="btn-gold"
        >
          {t('marketplace.registerNow')}
        </button>
      </div>
    </div>
  );
}
