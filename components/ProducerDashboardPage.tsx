'use client';

import { useEffect, useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchProducerInsights } from "@/lib/services/producer";
import type { ProducerInsights } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import ShoppingShell from "./ShoppingShell";

function formatCurrency(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function ProducerDashboardContent() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ProducerInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void fetchProducerInsights(tokens.accessToken)
      .then(setInsights)
      .catch(() => setError("Impossible de charger les statistiques producteur."))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Espace producteur</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Tableau de bord</h1>
            <p className="muted">Suivi des ventes, unités vendues et impact.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}

          {isLoading || !insights ? (
            <p className="muted">Chargement...</p>
          ) : (
            <>
              <div className="grid" style={{ gap: "var(--space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <article className="card" style={{ gap: "var(--space-1)" }}>
                  <strong>{insights.totalOrders}</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Commandes</span>
                </article>
                <article className="card" style={{ gap: "var(--space-1)" }}>
                  <strong>{insights.totalItemsSold}</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Unités vendues</span>
                </article>
                <article className="card" style={{ gap: "var(--space-1)" }}>
                  <strong>{formatCurrency(insights.totalRevenueCents)}</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Chiffre d&apos;affaires</span>
                </article>
                <article className="card" style={{ gap: "var(--space-1)" }}>
                  <strong>{formatCurrency(insights.averageOrderValueCents)}</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Panier moyen</span>
                </article>
                <article className="card" style={{ gap: "var(--space-1)" }}>
                  <strong>{(insights.totalImpactCo2Grams / 1000).toFixed(1)} kg CO2e</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>Impact évité</span>
                </article>
              </div>

              <div className="card" style={{ gap: "var(--space-2)" }}>
                <strong>Top produits</strong>
                {insights.topProducts.length === 0 ? (
                  <p className="muted">Aucun produit en tête pour le moment.</p>
                ) : (
                  <div className="grid" style={{ gap: "var(--space-1)" }}>
                    {insights.topProducts.map((p) => (
                      <div key={p.productId} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{p.title}</span>
                        <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
                          {p.unitsSold} unités • {(p.revenueCents / 100).toFixed(2)} EUR
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ProducerDashboardPage() {
  return (
    <ShoppingShell requireAuth requiredRole="producer">
      {() => <ProducerDashboardContent />}
    </ShoppingShell>
  );
}
