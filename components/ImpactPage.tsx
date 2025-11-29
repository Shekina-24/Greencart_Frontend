'use client';

import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import ShoppingShell from "./ShoppingShell";
import { useOrdersData } from "@/hooks/useOrdersData";

function prettyKg(value: number): string {
  return `${value.toFixed(1)} kg CO2e`;
}

function prettyCurrency(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function ImpactContent() {
  const { user } = useAuth();
  const { orders, isLoading, error } = useOrdersData(Boolean(user));

  useEffect(() => {
    if (!user && error && (error as Error).message === "missing-token") {
      console.warn("[ImpactPage] Missing authentication for impact data");
    }
  }, [user, error]);

  const displayError = useMemo(() => {
    if (!error) return null;
    if ((error as Error).message === "missing-token") {
      return null;
    }
    return "Impossible de charger les donnees d'impact.";
  }, [error]);

  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, o) => sum + o.totalItems, 0);
  const totalCo2Kg = orders.reduce((sum, o) => sum + o.totalImpactCo2Grams, 0) / 1000;
  const totalAmountCents = orders.reduce((sum, o) => sum + o.totalAmountCents, 0);
  const avgOrderCents = totalOrders > 0 ? totalAmountCents / totalOrders : 0;
  const totalSavingsCents = orders.reduce((orderAcc, order) => {
    const orderSavings = order.lines.reduce((lineAcc, line) => {
      const referenceUnit = line.referencePriceCents ?? line.unitPriceCents;
      const referenceTotal = referenceUnit * line.quantity;
      const savings = Math.max(referenceTotal - line.subtotalCents, 0);
      return lineAcc + savings;
    }, 0);
    return orderAcc + orderSavings;
  }, 0);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Mon impact</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Impact carbone et achats responsables</h1>
            <p className="muted">Bilan calcule a partir de vos commandes valides.</p>
          </div>

          {displayError ? <div className="alert alert--warning">{displayError}</div> : null}

          {isLoading ? (
            <p className="muted">Chargement...</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{totalOrders}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Commandes total</span>
              </article>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{totalItems}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Articles sauves</span>
              </article>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{prettyKg(totalCo2Kg)}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>CO₂ evites</span>
              </article>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{prettyCurrency(totalAmountCents)}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Total depense</span>
              </article>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{prettyCurrency(avgOrderCents)}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Panier moyen</span>
              </article>
              <article className="card" style={{ gap: "var(--space-2)" }}>
                <strong>{prettyCurrency(totalSavingsCents)}</strong>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Économies réalisées</span>
              </article>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ImpactPage() {
  return (
    <ShoppingShell requireAuth>
      {() => <ImpactContent />}
    </ShoppingShell>
  );
}
