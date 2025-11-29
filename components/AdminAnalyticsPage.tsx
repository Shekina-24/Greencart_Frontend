'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredTokens } from '@/lib/auth/tokens';
import { apiFetch } from '@/lib/api';
import ShoppingShell from '@/components/ShoppingShell';

interface SummaryRead {
  period_start: string;
  period_end: string;
  total_orders: number;
  total_revenue_cents: number;
  total_items_sold: number;
  average_order_value_cents: number;
  top_products: Array<{ product_id: number | null; product_title?: string | null; units: number; revenue_cents: number }>;
}

interface TimeseriesRead {
  points: Array<{ bucket: string; orders: number; revenue_cents: number; items: number; aov_cents: number }>;
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div className="muted" style={{ fontSize: 'var(--fs-small)' }}>{label}</div>
      <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
        <div style={{ width: `${pct}%`, height: 8, background: 'var(--primary-500, #22a)', borderRadius: 4 }} />
      </div>
      <div className="muted" style={{ fontSize: 'var(--fs-small)' }}>{value}</div>
    </div>
  );
}

function AdminAnalyticsContent() {
  const [summary, setSummary] = useState<SummaryRead | null>(null);
  const [series, setSeries] = useState<TimeseriesRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>("day");

  const loadAnalytics = async () => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    try {
      const [s, t] = await Promise.all([
        apiFetch<SummaryRead>(`/admin/reports/summary`, {
          authToken: tokens.accessToken,
          params: { period_start: start || undefined, period_end: end || undefined }
        }),
        apiFetch<TimeseriesRead>(`/analytics/timeseries`, {
          authToken: tokens.accessToken,
          params: { period_start: start || undefined, period_end: end || undefined, granularity }
        })
      ]);
      setSummary(s);
      setSeries(t);
    } catch (e) {
      setError('Impossible de charger les analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Init with default (serveur: 30 jours)
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxOrders = Math.max(0, ...(series?.points.map((p) => p.orders) ?? [0]));
  const maxRevenue = Math.max(0, ...(series?.points.map((p) => p.revenue_cents) ?? [0]));

  return (
    <main className="container" style={{ display: 'grid', gap: 'var(--space-12)' }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: 'var(--fs-small)' }}>
        <Link className="muted" href="/">Accueil</Link>
        {" / Admin / Analytics"}
      </nav>

      <section className="section">
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div>
            <div className="badge badge--impact">Administration</div>
            <h1 style={{ marginTop: 'var(--space-2)' }}>Analytics</h1>
            <p className="muted">Series temporelles, top produits et panier moyen.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}
          <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
            <input className="input" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
            <select className="select" value={granularity} onChange={(e)=>setGranularity(e.target.value as any)}>
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
            <button className="btn btn--primary" type="button" onClick={loadAnalytics}>Actualiser</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn--ghost" type="button" onClick={() => { const now = new Date(); const past = new Date(now); past.setDate(now.getDate()-30); setStart(past.toISOString().slice(0,10)); setEnd(now.toISOString().slice(0,10)); setGranularity('day'); }}>30j</button>
              <button className="btn btn--ghost" type="button" onClick={() => { const now = new Date(); const past = new Date(now); past.setDate(now.getDate()-90); setStart(past.toISOString().slice(0,10)); setEnd(now.toISOString().slice(0,10)); setGranularity('week'); }}>90j</button>
              <button className="btn btn--ghost" type="button" onClick={() => { const now = new Date(); const y = now.getFullYear(); const jan1 = new Date(Date.UTC(y,0,1)); setStart(jan1.toISOString().slice(0,10)); setEnd(now.toISOString().slice(0,10)); setGranularity('month'); }}>YTD</button>
              <button className="btn btn--ghost" type="button" onClick={() => { const now = new Date(); const past = new Date(now); past.setFullYear(now.getFullYear()-1); setStart(past.toISOString().slice(0,10)); setEnd(now.toISOString().slice(0,10)); setGranularity('month'); }}>12m</button>
            </div>
          </div>

          {isLoading ? (
            <p className="muted">Chargement...</p>
          ) : (
            <>
              {summary ? (
                <div className="card" style={{ display: 'grid', gap: 8 }}>
                  <strong>Periode</strong>
                  <div className="muted" style={{ fontSize: 'var(--fs-small)' }}>
                    {`${new Date(summary.period_start).toLocaleDateString('fr-FR')} -> ${new Date(summary.period_end).toLocaleDateString('fr-FR')}`}
                  </div>
                  <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    <div>Total commandes: {summary.total_orders}</div>
                    <div>Revenu total (centimes): {summary.total_revenue_cents}</div>
                    <div>Articles vendus: {summary.total_items_sold}</div>
                    <div>Panier moyen (centimes): {summary.average_order_value_cents}</div>
                  </div>
                </div>
              ) : null}

              {series ? (
                <div className="card" style={{ display: 'grid', gap: 12 }}>
                  <strong>Series temporelles (jour)</strong>
                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {series.points.map((p) => (
                      <div key={p.bucket} className="grid" style={{ gap: 8 }}>
                        <div className="muted" style={{ fontSize: 'var(--fs-small)' }}>{p.bucket}</div>
                        <Bar value={p.orders} max={maxOrders} label="Commandes" />
                        <Bar value={p.revenue_cents} max={maxRevenue} label="Revenu (c)" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {summary ? (
                <div className="card" style={{ display: 'grid', gap: 8 }}>
                  <strong>Top produits</strong>
                  {summary.top_products.length === 0 ? (
                    <p className="muted">Aucun produit.</p>
                  ) : (
                    <div className="grid" style={{ gap: 8 }}>
                      {summary.top_products.map((t, i) => (
                        <div key={`${t.product_id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{t.product_title || `Produit #${t.product_id ?? 'N/A'}`}</span>
                          <span className="muted" style={{ fontSize: 'var(--fs-small)' }}>{t.units} u. • {t.revenue_cents} c</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ShoppingShell requireAuth requiredRole="admin">
      {() => <AdminAnalyticsContent />}
    </ShoppingShell>
  );
}

