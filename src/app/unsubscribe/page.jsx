'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card-mystical max-w-md text-center py-8 px-6">
        {success ? (
          <>
            <div className="w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">Unsubscribed</h1>
            <p className="text-text-secondary text-sm mb-6">
              You have been successfully unsubscribed from daily rashifal emails. You can resubscribe anytime from our website.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-6">
              We couldn't process your unsubscribe request. Please try again or contact us.
            </p>
          </>
        )}
        <Link href="/" className="btn-outline-gold text-sm no-underline inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p className="text-text-secondary">Loading...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
