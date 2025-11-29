'use client';

import { useEffect, useRef, useState } from 'react';
import { ANALYTICS_CONSENT_EVENT, hasAnalyticsConsent } from '@/lib/analyticsConsent';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  // eslint-disable-next-line no-var
  var dataLayer: Array<Record<string, unknown>> | undefined;
}

function loadGTM(containerId: string) {
  if (typeof window === 'undefined') return;
  if (document.getElementById('greencart-gtm')) return; // already loaded
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'greencart-gtm';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
}

export default function GtmProvider() {
  const [consent, setConsent] = useState<boolean>(() => hasAnalyticsConsent());
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!GTM_ID) return;
    if (!consent) return;
    if (loadedRef.current) return;
    loadGTM(GTM_ID);
    loadedRef.current = true;
  }, [consent]);

  useEffect(() => {
    const onConsent = () => {
      setConsent(hasAnalyticsConsent());
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
  }, []);

  return null;
}
