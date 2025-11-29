import { apiFetch } from "@/lib/api";

interface PaymentSessionRead {
  checkout_url: string;
  payment_reference: string;
}

interface PaymentInitRequest {
  order_id: number;
  provider: string; // e.g. 'stripe'
  success_url: string;
  cancel_url: string;
}

export async function initPayment(
  authToken: string,
  payload: PaymentInitRequest
): Promise<PaymentSessionRead> {
  return apiFetch<PaymentSessionRead>("/payments/init", {
    method: "POST",
    authToken,
    body: JSON.stringify(payload)
  });
}

