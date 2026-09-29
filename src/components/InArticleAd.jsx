'use client';

import { useEffect, useRef } from 'react';

/**
 * Google AdSense in-article ad — fluid format that blends with content.
 */
export default function InArticleAd({ className = '' }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or blocked
    }
  }, []);

  return (
    <div className={`ad-container my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-8134913049399970"
        data-ad-slot="1146471102"
      />
    </div>
  );
}
