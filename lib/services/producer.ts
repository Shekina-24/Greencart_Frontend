import { apiFetch } from "@/lib/api";
import { mapProductFromApi } from "@/lib/services/products";
import type { Product, ProducerInsights, ProducerOrder, ProducerOrderList } from "@/lib/types";

interface ProductImageRead {
  url: string;
  is_primary: boolean;
}

interface ProductRead {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  region: string | null;
  origin: string | null;
  dlc_date: string | null;
  impact_co2_g: number | null;
  price_cents: number;
  promo_price_cents: number | null;
  stock: number;
  status: string;
  is_published: boolean;
  images: ProductImageRead[];
}

interface ProductListResponse {
  items: ProductRead[];
  total: number;
  limit: number;
  offset: number;
}

interface ProducerInsightsRead {
  total_orders: number;
  total_revenue_cents: number;
  total_items_sold: number;
  average_order_value_cents: number;
  total_impact_co2_g: number;
  top_products: Array<{
    product_id: number;
    title: string;
    revenue_cents: number;
    units_sold: number;
    average_rating?: number | null;
  }>;
}

interface ProducerOrderLineRead {
  id: number;
  order_id: number;
  product_id: number | null;
  product_title: string;
  quantity: number;
  unit_price_cents: number;
  reference_price_cents?: number | null;
  subtotal_cents: number;
  created_at: string;
}

interface ProducerOrderRead {
  order_id: number;
  status: string;
  customer_id: number;
  customer_email: string;
  created_at: string;
  total_amount_cents: number;
  lines: ProducerOrderLineRead[];
}

interface ProducerOrderListResponse {
  items: ProducerOrderRead[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchProducerInsights(authToken: string): Promise<ProducerInsights> {
  const response = await apiFetch<ProducerInsightsRead>("/producer/insights", { authToken });
  return {
    totalOrders: response.total_orders,
    totalRevenueCents: response.total_revenue_cents,
    totalItemsSold: response.total_items_sold,
    averageOrderValueCents: response.average_order_value_cents,
    totalImpactCo2Grams: response.total_impact_co2_g,
    topProducts: response.top_products.map((p) => ({
      productId: p.product_id,
      title: p.title,
      revenueCents: p.revenue_cents,
      unitsSold: p.units_sold,
      averageRating: p.average_rating ?? null
    }))
  };
}

export async function fetchMyProducts(
  authToken: string,
  params: { limit?: number; offset?: number } = {}
): Promise<{ items: Product[]; total: number; limit: number; offset: number }> {
  const response = await apiFetch<ProductListResponse>("/producer/products", {
    authToken,
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    }
  });
  return {
    items: response.items.map(mapProductFromApi),
    total: response.total,
    limit: response.limit,
    offset: response.offset
  };
}

export async function createMyProduct(
  authToken: string,
  payload: {
    title: string;
    priceCents: number;
    stock: number;
    description?: string | null;
    category?: string | null;
    region?: string | null;
    origin?: string | null;
    dlcDate?: string | null;
    impactCo2Grams?: number | null;
    promoPriceCents?: number | null;
    status?: string | null;
    isPublished?: boolean | null;
    images?: Array<{ url: string; isPrimary?: boolean }>;
  }
): Promise<Product> {
  const body: Record<string, unknown> = {
    title: payload.title,
    price_cents: payload.priceCents,
    stock: payload.stock,
    description: payload.description ?? null,
    category: payload.category ?? null,
    region: payload.region ?? null,
    origin: payload.origin ?? null,
    dlc_date: payload.dlcDate ?? null,
    impact_co2_g: payload.impactCo2Grams ?? null,
    promo_price_cents: payload.promoPriceCents ?? null,
    is_published: payload.isPublished ?? false,
    images: (payload.images ?? []).map((i) => ({ url: i.url, is_primary: Boolean(i.isPrimary) }))
  };
  if (payload.status) {
    body.status = payload.status;
  }
  const response = await apiFetch<ProductRead>("/products", {
    method: "POST",
    authToken,
    body: JSON.stringify(body)
  });
  return mapProductFromApi(response);
}

export async function updateMyProduct(
  authToken: string,
  productId: number,
  payload: Partial<{
    title: string;
    description: string | null;
    category: string | null;
    region: string | null;
    origin: string | null;
    dlcDate: string | null;
    impactCo2Grams: number | null;
    priceCents: number | null;
    promoPriceCents: number | null;
    stock: number | null;
    status: string | null;
    isPublished: boolean | null;
  }>
): Promise<Product> {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.region !== undefined) body.region = payload.region;
  if (payload.origin !== undefined) body.origin = payload.origin;
  if (payload.dlcDate !== undefined) body.dlc_date = payload.dlcDate;
  if (payload.impactCo2Grams !== undefined) body.impact_co2_g = payload.impactCo2Grams;
  if (payload.priceCents !== undefined) body.price_cents = payload.priceCents;
  if (payload.promoPriceCents !== undefined) body.promo_price_cents = payload.promoPriceCents;
  if (payload.stock !== undefined) body.stock = payload.stock;
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.isPublished !== undefined) body.is_published = payload.isPublished;

  const response = await apiFetch<ProductRead>(`/producer/products/${productId}`, {
    method: "PUT",
    authToken,
    body: JSON.stringify(body)
  });
  return mapProductFromApi(response);
}

export async function deleteMyProduct(authToken: string, productId: number): Promise<void> {
  await apiFetch<void>(`/producer/products/${productId}`, {
    method: "DELETE",
    authToken
  });
}

export async function fetchProducerOrders(
  authToken: string,
  params: { limit?: number; offset?: number } = {}
): Promise<ProducerOrderList> {
  const response = await apiFetch<ProducerOrderListResponse>("/producer/orders", {
    authToken,
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    }
  });
  return {
    items: response.items.map((o) => ({
      orderId: o.order_id,
      status: o.status,
      customerId: o.customer_id,
      customerEmail: o.customer_email,
      createdAt: o.created_at,
      totalAmountCents: o.total_amount_cents,
      lines: o.lines.map((l) => ({
        id: l.id,
        orderId: l.order_id,
        productId: l.product_id,
        productTitle: l.product_title,
        quantity: l.quantity,
        unitPriceCents: l.unit_price_cents,
        referencePriceCents: l.reference_price_cents ?? null,
        subtotalCents: l.subtotal_cents,
        createdAt: l.created_at
      }))
    })),
    total: response.total,
    limit: response.limit,
    offset: response.offset
  };
}
