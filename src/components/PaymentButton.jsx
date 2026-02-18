'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

const isTestMode =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');

export default function PaymentButton({ amount, reportType, reportName, onPaymentSuccess, disabled, className }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showTestInfo, setShowTestInfo] = useState(false);
  const { data: session, status } = useSession();

  const handlePayment = async () => {
    // Auth gate: require sign-in before payment
    if (!session) {
      signIn('google');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order on backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay takes amount in paise
          currency: 'INR',
          reportType,
          notes: { reportName },
        }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const { orderId } = await res.json();

      // Step 2: Open Razorpay Checkout popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: process.env.NEXT_PUBLIC_APP_NAME || 'MyRashifal+',
        description: reportName,
        order_id: orderId,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                reportType,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              onPaymentSuccess(response.razorpay_payment_id);
            } else {
              alert(t('payment.verifyFailed'));
            }
          } catch {
            alert(t('payment.verifyError'));
          }
          setLoading(false);
        },
        prefill: {
          name: '',
        },
        theme: {
          color: '#d4a017',
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        alert(t('payment.failed'));
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('payment.error'));
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className={className || 'btn-gold w-full'}
      >
        {loading ? t('payment.processing') : !session ? t('payment.signInToUnlock', { amount }) : t('payment.unlockFor', { amount })}
      </button>

      {isTestMode && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowTestInfo(!showTestInfo)}
            className="flex items-center gap-1 text-[11px] text-blue-400/80 hover:text-blue-400 transition-colors"
          >
            <span>ℹ️</span>
            <span>{showTestInfo ? 'Hide test details' : 'Test mode — click for card details'}</span>
          </button>
          {showTestInfo && (
            <div className="mt-1.5 rounded border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-[11px] text-text-secondary space-y-0.5 animate-fade-in">
              <div>Card: <code className="text-blue-300">4111 1111 1111 1111</code></div>
              <div>Expiry: <span className="text-blue-300">Any future date</span> &middot; CVV: <span className="text-blue-300">Any 3 digits</span></div>
              <div>UPI: <code className="text-blue-300">success@razorpay</code></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
