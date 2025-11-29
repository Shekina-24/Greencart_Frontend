'use client';

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import ShoppingShell from "./ShoppingShell";
import type { ShoppingExperience } from "@/hooks/useShoppingExperience";
import { useOrdersData } from "@/hooks/useOrdersData";

function formatCurrency(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function OrdersContent({ experience, successOrder }: { experience: ShoppingExperience; successOrder: string | null }) {
  const { user } = useAuth();
  const openAuthModal = experience.openAuthModal;
  const { orders, isLoading, error } = useOrdersData(Boolean(user));

  useEffect(() => {
    if (!user) {
      openAuthModal("login");
    }
  }, [user, openAuthModal]);

  useEffect(() => {
    if (error && (error as Error).message === "missing-token") {
      openAuthModal("login");
    }
  }, [error, openAuthModal]);

  const displayError = useMemo(() => {
    if (!error) return null;
    if ((error as Error).message === "missing-token") {
      return null;
    }
    console.error("[OrdersPage] Failed to load orders", error);
    return "Impossible de recuperer vos commandes.";
  }, [error]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/catalogue">
          Catalogue
        </Link>
        {" / Mes commandes"}
      </nav>

      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Historique</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Mes commandes</h1>
            <p className="muted">Suivez vos commandes passees et leur impact carbone evite.</p>
          </div>

          {successOrder ? (
            <div className="alert alert--success" role="status">
              Commande #{successOrder} confirm�e. Merci pour votre achat !
            </div>
          ) : null}

          {displayError ? <div className="alert alert--warning">{displayError}</div> : null}

          {isLoading ? (
            <p className="muted">Chargement des commandes...</p>
          ) : orders.length === 0 ? (
            <p className="muted">Vous n&apos;avez pas encore passe de commande.</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              {orders.map((order) => (
                <article key={order.id} className="card" style={{ gap: "var(--space-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                    <strong>Commande #{order.id}</strong>
                    <span className="muted">{new Date(order.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="muted" style={{ fontSize: "var(--fs-small)", display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge ${order.status === 'paid' ? 'badge--impact' : order.status === 'cancelled' ? 'badge--secondary' : order.status === 'refunded' ? 'badge--secondary' : ''}`}>{order.status}</span>
                    <span>{order.totalItems} article{order.totalItems > 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "grid", gap: "var(--space-1)" }}>
                    {order.lines.map((line) => (
                      <div key={line.id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{line.productTitle}</span>
                        <span>{formatCurrency(line.subtotalCents, order.currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmountCents, order.currency)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                    Impact carbone evite : {(order.totalImpactCo2Grams / 1000).toFixed(1)} kg CO2e
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function OrdersPage({ successOrder = null }: { successOrder?: string | null } = {}) {
  return (
    <ShoppingShell requireAuth>
      {(experience) => <OrdersContent experience={experience} successOrder={successOrder} />}
    </ShoppingShell>
  );
}



