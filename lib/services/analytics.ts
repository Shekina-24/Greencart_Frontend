import { apiFetch } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

interface AnalyticsSummaryRead {
  period_start: string;
  period_end: string;
  total_orders: number;
  total_revenue_cents: number;
  total_items_sold: number;
  average_order_value_cents: number;
  top_products: Array<{
    product_id: number | null;
    product_title?: string | null;
    units: number;
    revenue_cents: number;
  }>;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await apiFetch<AnalyticsSummaryRead>("/analytics/summary", {
    cache: "no-store"
  });

  return {
    periodStart: response.period_start,
    periodEnd: response.period_end,
    totalOrders: response.total_orders,
    totalRevenueCents: response.total_revenue_cents,
    totalItemsSold: response.total_items_sold,
    averageOrderValueCents: response.average_order_value_cents,
    topProducts: response.top_products.map((product) => ({
      productId: product.product_id,
      productTitle: product.product_title ?? null,
      units: product.units,
      revenueCents: product.revenue_cents
    }))
  };
}

export interface AnalyticsEmbedToken {
  embedUrl: string;
  token: string;
  expiresAt: string;
}

export interface AnalyticsEmbedFilter {
  region?: string;
  producerId?: number;
  dateStart?: string;
  dateEnd?: string;
}

export async function fetchAdminAnalyticsEmbedToken(authToken: string, filters: AnalyticsEmbedFilter): Promise<AnalyticsEmbedToken> {
  const payload: Record<string, unknown> = {
    region: filters.region || undefined,
    producer_id: filters.producerId,
    date_start: filters.dateStart || undefined,
    date_end: filters.dateEnd || undefined
  };

  const response = await apiFetch<{ embed_url: string; token: string; expires_at: string }>("/analytics/embed-token", {
    method: "POST",
    authToken,
    body: JSON.stringify(payload)
  });

  return {
    embedUrl: response.embed_url,
    token: response.token,
    expiresAt: response.expires_at
  };
}
