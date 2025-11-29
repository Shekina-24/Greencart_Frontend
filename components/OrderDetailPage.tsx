'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchOrder } from "@/lib/services/orders";
import type { Order } from "@/lib/types";
import ShoppingShell from "./ShoppingShell";

function formatCurrency(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function OrderContent({ orderId }: { orderId: number }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void fetchOrder(tokens.accessToken, orderId)
      .then((o) => setOrder(o))
      .catch(() => setError("Impossible de charger cette commande."))
      .finally(() => setIsLoading(false));
  }, [user, orderId]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/compte/commandes">
          Mes commandes
        </Link>
        {` / #${orderId}`}
      </nav>

      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Commande</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Détail commande #{orderId}</h1>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}

          {isLoading || !order ? (
            <p className="muted">Chargement...</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              <div className="card" style={{ gap: "var(--space-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Statut</strong>
                  <span>{order.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Date</span>
                  <span>{new Date(order.createdAt).toLocaleString("fr-FR")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Articles</span>
                  <span>{order.totalItems}</span>
                </div>
              </div>

              <div className="card" style={{ gap: "var(--space-2)" }}>
                <strong>Lignes</strong>
                {order.lines.map((line) => (
                  <div key={line.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-2)" }}>
                    <span>{line.productTitle}</span>
                    <span className="muted">x{line.quantity}</span>
                    <span style={{ textAlign: "right" }}>{formatCurrency(line.subtotalCents, order.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Total</strong>
                <span>{formatCurrency(order.totalAmountCents, order.currency)}</span>
              </div>

              <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                Impact carbone évité : {(order.totalImpactCo2Grams / 1000).toFixed(1)} kg CO2e
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function OrderDetailPage({ orderId }: { orderId: number }) {
  return (
    <ShoppingShell requireAuth>
      {() => <OrderContent orderId={orderId} />}
    </ShoppingShell>
  );
}

