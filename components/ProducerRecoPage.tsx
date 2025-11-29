'use client';

import { useEffect, useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { apiFetch } from "@/lib/api";
import ShoppingShell from "./ShoppingShell";

interface ForecastItem { product_id: number; title: string; avg_weekly_units: number; forecast_next_weeks: number[] }
interface Segments { k: number; centroids: Array<{ aov_cents: number; avg_items: number }>; counts: number[] }

function ProducerRecoContent() {
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [segments, setSegments] = useState<Segments | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setLoading(true);
    setError(null);
    void Promise.all([
      apiFetch<{ items: ForecastItem[] }>("/producer/recommendations/forecast", { authToken: tokens.accessToken }),
      apiFetch<Segments>("/producer/recommendations/segments", { authToken: tokens.accessToken })
    ])
      .then(([f, s]) => { setForecast(f.items); setSegments(s); })
      .catch(() => setError("Impossible de charger les recommandations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Espace producteur</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Recommandations IA</h1>
            <p className="muted">Prévisions hebdomadaires basiques et segmentation clients (K‑means).</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}
          {loading ? <p className="muted">Chargement...</p> : (
            <>
              <div className="card" style={{ display: 'grid', gap: 8 }}>
                <strong>Prévisions (moyenne mobile)</strong>
                {forecast.length === 0 ? <p className="muted">Aucun historique.</p> : (
                  <div className="grid" style={{ gap: 8 }}>
                    {forecast.slice(0, 8).map((it) => (
                      <div key={it.product_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>{it.title}</span>
                        <span className="muted" style={{ fontSize: 'var(--fs-small)' }}>moy. hebdo: {it.avg_weekly_units} • prochaine 4 sem.: {it.forecast_next_weeks.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ display: 'grid', gap: 8 }}>
                <strong>Segments clients (K = {segments?.k ?? 0})</strong>
                {!segments ? <p className="muted">—</p> : (
                  <div className="grid" style={{ gap: 8 }}>
                    {segments.centroids.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Segment #{i+1}</span>
                        <span className="muted" style={{ fontSize: 'var(--fs-small)' }}>{segments.counts[i]} clients • AOV ~ {(c.aov_cents/100).toFixed(2)} EUR • {c.avg_items} items/commande</span>
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

export default function ProducerRecoPage() {
  return (
    <ShoppingShell requireAuth requiredRole="producer">
      {() => <ProducerRecoContent />}
    </ShoppingShell>
  );
}
