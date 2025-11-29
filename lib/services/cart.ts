import { apiFetch } from "@/lib/api";

interface CartItemRead {
  id: number;
  product_id: number;
  product_title: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  items: CartItemRead[];
  total_items: number;
  total_amount_cents: number;
}

export interface CartUpdateInput {
  productId: number;
  quantity: number;
}

export async function fetchCart(authToken: string): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart", {
    authToken
  });
}

export async function setCartItems(
  authToken: string,
  updates: CartUpdateInput[]
): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart", {
    method: "PUT",
    authToken,
    body: JSON.stringify(
      updates.map((update) => ({
        product_id: update.productId,
        quantity: update.quantity
      }))
    )
  });
}

export async function clearCart(authToken: string): Promise<void> {
  await apiFetch<void>("/cart", {
    method: "DELETE",
    authToken
  });
}

export type { CartItemRead };
