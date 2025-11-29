'use client';

import { hasAnalyticsConsent } from '@/lib/analyticsConsent';
import { getApiBase } from '@/lib/api';

declare global {
  // eslint-disable-next-line no-var
  var dataLayer: Array<Record<string, unknown>> | undefined;
}

type AnalyticsEventName = 'view_product' | 'add_to_cart' | 'begin_checkout' | 'purchase';

const ANALYTICS_ENDPOINT = new URL('/api/v1/analytics/events', getApiBase()).toString();
const ANALYTICS_SOURCE = 'web_app';
const DEFAULT_CURRENCY = 'EUR';

interface EcommerceItem {
  item_id: number;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  price?: number;
  quantity?: number;
}

function eurosFromCents(value?: number | null): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value / 100;
}

function shouldTrack(): boolean {
  return typeof window !== 'undefined' && hasAnalyticsConsent();
}

function emitAnalyticsEvent(
  eventName: AnalyticsEventName,
  gtmEvent: string,
  properties: Record<string, unknown>,
  gtmExtras: Record<string, unknown> = {},
): void {
  if (!shouldTrack()) {
    return;
  }

  pushToDataLayer(eventName, gtmEvent, properties, gtmExtras);
  forwardToBackend(eventName, gtmEvent, properties);
}

function pushToDataLayer(
  eventName: AnalyticsEventName,
  gtmEvent: string,
  properties: Record<string, unknown>,
  gtmExtras: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: gtmEvent,
    greencartEvent: eventName,
    timestamp: new Date().toISOString(),
    ...properties,
    ...gtmExtras,
  });
}

function forwardToBackend(eventName: AnalyticsEventName, gtmEvent: string, properties: Record<string, unknown>) {
  const payload = {
    event_name: eventName,
    source: ANALYTICS_SOURCE,
    properties: {
      ...properties,
      gtm_event: gtmEvent,
    },
  };
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
      if (queued) {
        return;
      }
    }
  } catch {
    // Ignore beacon errors and fallback to fetch.
  }

  void fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Swallow fetch errors; analytics is best-effort.
  });
}

export function trackViewProduct(product: { id: number; name: string; priceCents?: number | null; category?: string; region?: string }) {
  const priceCents = product.priceCents ?? null;
  const properties = {
    product_id: product.id,
    name: product.name,
    price_cents: priceCents,
    category: product.category ?? null,
    region: product.region ?? null,
  };

  const priceEuros = eurosFromCents(priceCents);
  const items: EcommerceItem[] = [
    {
      item_id: product.id,
      item_name: product.name,
      ...(product.category ? { item_category: product.category } : {}),
      ...(product.region ? { item_category2: product.region } : {}),
      ...(priceEuros !== null ? { price: priceEuros } : {}),
    },
  ];

  const ecommercePayload = {
    currency: DEFAULT_CURRENCY,
    ...(priceEuros !== null ? { value: priceEuros } : {}),
    items,
  };

  emitAnalyticsEvent('view_product', 'view_item', properties, { ecommerce: ecommercePayload });
}

export function trackAddToCart(item: { id: number; name: string; quantity: number; priceCents?: number | null }) {
  const properties = {
    product_id: item.id,
    name: item.name,
    quantity: item.quantity,
    price_cents: item.priceCents ?? null,
  };
  const unitPrice = eurosFromCents(item.priceCents ?? null);
  const lineValue = unitPrice !== null ? unitPrice * item.quantity : null;
  const ecommercePayload = {
    currency: DEFAULT_CURRENCY,
    ...(lineValue !== null ? { value: lineValue } : {}),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        ...(unitPrice !== null ? { price: unitPrice } : {}),
      },
    ],
  };

  emitAnalyticsEvent('add_to_cart', 'add_to_cart', properties, { ecommerce: ecommercePayload });
}

export function trackBeginCheckout(payload: { totalCents: number; items: Array<{ id: number; quantity: number; priceCents?: number | null }> }) {
  const properties = {
    total_cents: payload.totalCents,
    item_count: payload.items.reduce((total, item) => total + item.quantity, 0),
    items: payload.items,
  };
  const totalValue = eurosFromCents(payload.totalCents);
  const ecommercePayload = {
    currency: DEFAULT_CURRENCY,
    ...(totalValue !== null ? { value: totalValue } : {}),
    items: payload.items.map((item) => {
      const unitPrice = eurosFromCents(item.priceCents ?? null);
      const gaItem: EcommerceItem = {
        item_id: item.id,
        item_name: String(item.id),
        quantity: item.quantity,
      };
      if (unitPrice !== null) {
        gaItem.price = unitPrice;
      }
      return gaItem;
    }),
  };

  emitAnalyticsEvent('begin_checkout', 'begin_checkout', properties, { ecommerce: ecommercePayload });
}

export function trackPurchase(payload: { orderId: number; currency: string; totalCents: number }) {
  const properties = {
    order_id: payload.orderId,
    currency: payload.currency,
    value_cents: payload.totalCents,
  };
  const totalValue = eurosFromCents(payload.totalCents);
  const ecommercePayload = {
    currency: payload.currency ?? DEFAULT_CURRENCY,
    transaction_id: payload.orderId,
    ...(totalValue !== null ? { value: totalValue } : {}),
  };

  emitAnalyticsEvent('purchase', 'purchase', properties, { ecommerce: ecommercePayload });
}
