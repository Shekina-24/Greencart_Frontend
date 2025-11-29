import { apiFetch } from "@/lib/api";
import type { Order, OrderList, OrderLine } from "@/lib/types";

interface OrderLineRead {
  id: number;
  product_id: number | null;
  product_title: string;
  quantity: number;
  unit_price_cents: number;
  reference_price_cents?: number | null;
  subtotal_cents: number;
  impact_co2_g: number | null;
  created_at: string;
  updated_at: string;
}

interface OrderRead {
  id: number;
  status: string;
  currency: string;
  total_amount_cents: number;
  total_items: number;
  total_impact_co2_g: number;
  payment_reference: string | null;
  payment_provider: string | null;
  idempotency_key: string | null;
  placed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lines: OrderLineRead[];
}

interface OrderListResponse {
  items: OrderRead[];
  total: number;
  limit: number;
  offset: number;
}

interface CreateOrderRequest {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  notes?: string | null;
}

export async function createOrder(
  authToken: string,
  payload: CreateOrderRequest,
  idempotencyKey: string
): Promise<Order> {
  const response = await apiFetch<OrderRead>("/orders", {
    method: "POST",
    authToken,
    body: JSON.stringify(payload),
    headers: {
      "Idempotency-Key": idempotencyKey
    }
  });
  return mapOrderFromApi(response);
}

export async function fetchOrders(
  authToken: string,
  params: { limit?: number; offset?: number } = {}
): Promise<OrderList> {
  const response = await apiFetch<OrderListResponse>("/orders", {
    authToken,
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    }
  });
  return {
    items: response.items.map(mapOrderFromApi),
    total: response.total,
    limit: response.limit,
    offset: response.offset
  };
}

export async function fetchOrder(authToken: string, orderId: number): Promise<Order> {
  const response = await apiFetch<OrderRead>(`/orders/${orderId}`, {
    authToken
  });
  return mapOrderFromApi(response);
}

function mapOrderFromApi(order: OrderRead): Order {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    totalAmountCents: order.total_amount_cents,
    totalItems: order.total_items,
    totalImpactCo2Grams: order.total_impact_co2_g,
    paymentReference: order.payment_reference,
    paymentProvider: order.payment_provider,
    idempotencyKey: order.idempotency_key,
    placedAt: order.placed_at,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    lines: order.lines.map(mapOrderLineFromApi)
  };
}

function mapOrderLineFromApi(line: OrderLineRead): OrderLine {
  return {
    id: line.id,
    productId: line.product_id,
    productTitle: line.product_title,
    quantity: line.quantity,
    unitPriceCents: line.unit_price_cents,
    referencePriceCents: line.reference_price_cents ?? null,
    subtotalCents: line.subtotal_cents,
    impactCo2Grams: line.impact_co2_g,
    createdAt: line.created_at,
    updatedAt: line.updated_at
  };
}
