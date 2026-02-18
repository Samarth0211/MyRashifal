'use client';

import { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoadingScreen({ message }) {
  const { t } = useLanguage();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = message || t(`loading.${msgIndex}`);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Zodiac Spinner */}
      <div className="relative mb-8">
        <div className="zodiac-spinner" />
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold-primary rounded-full" />
        </div>
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 bg-gold-light rounded-full" />
        </div>
      </div>

      {/* Loading text */}
      <p className="text-gold-light font-heading text-lg animate-pulse text-center">
        {displayMessage}
      </p>

      {/* Subtle progress bar */}
      <div className="w-48 h-0.5 bg-border-custom rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-gold-gradient rounded-full"
          style={{
            animation: 'shimmer 1.5s ease-in-out infinite',
            width: '100%',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
}
