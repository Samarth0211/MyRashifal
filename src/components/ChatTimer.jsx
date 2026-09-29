'use client';

import { useState, useEffect } from 'react';

export default function ChatTimer({ startedAt, duration, onExpire }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, duration, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 30;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-bold ${
        isLow
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : 'bg-gold-primary/10 text-gold-light'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
