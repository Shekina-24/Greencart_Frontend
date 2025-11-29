'use client';

export const ANALYTICS_CONSENT_KEY = 'greencart_consent_analytics';
export const ANALYTICS_CONSENT_EVENT = 'greencart:consent-changed';

export type AnalyticsConsentValue = 'granted' | 'denied' | null;

export function readAnalyticsConsent(): AnalyticsConsentValue {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (stored === 'granted' || stored === 'denied') {
    return stored;
  }
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return readAnalyticsConsent() === 'granted';
}

export function persistAnalyticsConsent(value: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}
