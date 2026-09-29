'use client';

import { useEffect, useRef } from 'react';

/**
 * Google AdSense ad banner component.
 * Only renders when NEXT_PUBLIC_ADSENSE_PUB_ID is set.
 *
 * Placements:
 * - "in-article" — blends with content (between sections)
 * - "display"    — responsive banner (sidebar, footer area)
 * - "multiplex"  — content recommendation grid
 */
export default function AdBanner({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  className = '',
}) {
  const pubId = 'ca-pub-8134913049399970';
  const adRef = useRef(null);
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
    <div className={`ad-container my-6 flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={pubId}
        data-ad-slot={slot || '9728173282'}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
}
