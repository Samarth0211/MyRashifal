'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentButton({ amount, reportType, reportName, onPaymentSuccess, disabled, className }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
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
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={className || 'btn-gold w-full'}
    >
      {loading ? t('payment.processing') : !session ? t('payment.signInToUnlock', { amount }) : t('payment.unlockFor', { amount })}
    </button>
  );
}
