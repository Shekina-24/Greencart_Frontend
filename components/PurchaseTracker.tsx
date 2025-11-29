'use client';

import { useEffect } from 'react';
import { getStoredTokens } from '@/lib/auth/tokens';
import { fetchOrder } from '@/lib/services/orders';
import { trackPurchase } from '@/lib/analyticsEvents';

export default function PurchaseTracker({ orderId }: { orderId: number | null }) {
  useEffect(() => {
    if (!orderId) return;
    // Deduplicate per session
    const key = `greencart_purchase_tracked_${orderId}`;
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(key)) return;

    const tokens = getStoredTokens();
    if (!tokens) return;
    void fetchOrder(tokens.accessToken, orderId)
      .then((order) => {
        trackPurchase({ orderId: order.id, currency: order.currency, totalCents: order.totalAmountCents });
        window.sessionStorage.setItem(key, '1');
      })
      .catch(() => {
        // ignore errors; tracking is best-effort
      });
  }, [orderId]);

  return null;
}

