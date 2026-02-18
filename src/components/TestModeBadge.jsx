'use client';

import { useState } from 'react';

const isTestMode =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');

export default function TestModeBadge() {
  const [expanded, setExpanded] = useState(false);

  if (!isTestMode) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 no-print">
      {/* Expanded panel */}
      {expanded && (
        <div
          className="mb-2 rounded-lg border border-blue-500/30 bg-[#0f1035] p-4 shadow-lg shadow-blue-500/10 animate-fade-in"
          style={{ width: '280px' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-400">
              Test Mode Payment Details
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-text-secondary hover:text-text-primary text-lg leading-none"
              aria-label="Close test mode details"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <div>
              <span className="text-text-primary font-medium">Card:</span>{' '}
              <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-300 select-all">
                4111 1111 1111 1111
              </code>
            </div>
            <div>
              <span className="text-text-primary font-medium">Expiry:</span>{' '}
              <span className="text-blue-300">Any future date</span>
            </div>
            <div>
              <span className="text-text-primary font-medium">CVV:</span>{' '}
              <span className="text-blue-300">Any 3 digits</span>
            </div>
            <div className="border-t border-border-custom pt-2 mt-2">
              <span className="text-text-primary font-medium">UPI:</span>{' '}
              <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-300 select-all">
                success@razorpay
              </code>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-text-secondary/60 leading-tight">
            These credentials work only in Razorpay test mode. No real money is charged.
          </p>
        </div>
      )}

      {/* Badge button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-[#0f1035] px-3 py-1.5 text-xs font-medium text-blue-400 shadow-lg shadow-blue-500/10 transition-all hover:border-blue-400/50 hover:bg-blue-500/10"
      >
        <span className="text-sm">ℹ️</span>
        Test Mode
      </button>
    </div>
  );
}
