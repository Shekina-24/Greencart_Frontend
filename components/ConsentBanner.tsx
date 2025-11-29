'use client';

import { useCallback, useEffect, useState } from 'react';
import { persistAnalyticsConsent, readAnalyticsConsent } from '@/lib/analyticsConsent';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readAnalyticsConsent();
    setVisible(stored !== 'granted' && stored !== 'denied');
  }, []);

  const setConsent = useCallback((value: 'granted' | 'denied') => {
    persistAnalyticsConsent(value);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div role="dialog" aria-live="polite" className="card" style={{ position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: 720, margin: '0 auto', zIndex: 1000 }}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <strong>Cookies d&apos;analyse (GTM/GA)</strong>
        <p className="muted" style={{ margin: 0 }}>
          Nous utilisons des cookies d&apos;analyse pour comprendre l&apos;usage et améliorer GreenCart. Vous pouvez accepter ou refuser.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn" type="button" onClick={() => setConsent('denied')}>Refuser</button>
          <button className="btn btn--primary" type="button" onClick={() => setConsent('granted')}>Accepter</button>
        </div>
      </div>
    </div>
  );
}

