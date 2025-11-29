'use client';

import { useEffect, useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchProducerOrders } from "@/lib/services/producer";
import { useToast } from "@/components/ToastProvider";
import type { ProducerOrder } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import ShoppingShell from "./ShoppingShell";
import Skeleton from "@/components/Skeleton";

function formatCurrency(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function ProducerOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<'date_desc' | 'total_desc'>("date_desc");

  useEffect(() => {
    if (!user) return;
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void fetchProducerOrders(tokens.accessToken, { limit, offset: (page - 1) * limit })
      .then((res) => setOrders(res.items))
      .catch(() => setError("Impossible de charger les commandes."))
      .finally(() => setIsLoading(false));
  }, [user, page, limit]);

  const filteredOrders = (() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? orders.filter(o => `${o.customerEmail} ${o.orderId}`.toLowerCase().includes(q))
      : orders.slice();
    if (fromDate) {
      const fromTs = new Date(fromDate).getTime();
      list = list.filter(o => new Date(o.createdAt).getTime() >= fromTs);
    }
    if (toDate) {
      const toTs = new Date(toDate).getTime();
      list = list.filter(o => new Date(o.createdAt).getTime() <= toTs);
    }
    list.sort((a, b) => {
      if (sort === 'total_desc') return b.totalAmountCents - a.totalAmountCents;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  })();

  const exportCsv = () => {
    if (filteredOrders.length === 0) {
      showToast('Aucune commande à exporter', 'warning');
      return;
    }
    const header = ['order_id','status','created_at','customer_email','line_count','total_cents'];
    const rows = filteredOrders.map(o => [o.orderId, o.status, o.createdAt, o.customerEmail, o.lines.length, o.totalAmountCents]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commandes_producteur.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Espace producteur</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Commandes</h1>
            <p className="muted">Commandes contenant vos produits.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}

          {isLoading ? (
            <div className="grid" style={{ gap: "var(--space-3)" }}>{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} height={120} />))}</div>
          ) : filteredOrders.length === 0 ? (
            <p className="muted">Aucune commande pour l&apos;instant.</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              {filteredOrders.map((o) => (
                <article key={o.orderId} className="card" style={{ gap: "var(--space-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Commande #{o.orderId}</strong>
                    <span className="muted" style={{ fontSize: "var(--fs-small)" }}>{new Date(o.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="muted" style={{ fontSize: "var(--fs-small)" }}>Client: {o.customerEmail} · Statut: {o.status}</div>
                  <div style={{ display: "grid", gap: "var(--space-1)" }}>
                    {o.lines.map((l) => (
                      <div key={l.id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{l.productTitle} x{l.quantity}</span>
                        <span>{formatCurrency(l.subtotalCents)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                    <span>Total</span>
                    <span>{formatCurrency(o.totalAmountCents)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="input" placeholder="Rechercher (email, #id)" value={query} onChange={(e)=>setQuery(e.target.value)} />
              <select className="select" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
                <option value="date_desc">Plus récentes</option>
                <option value="total_desc">Total décroissant</option>
              </select>
              <input className="input" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
              <input className="input" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn--ghost" type="button" disabled={page<=1} onClick={() => setPage(p=>Math.max(1,p-1))}>Prec.</button>
              <button className="btn btn--ghost" type="button" onClick={() => setPage(p=>p+1)}>Suiv.</button>
            </div>
            <button className="btn" type="button" onClick={exportCsv}>Exporter CSV</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProducerOrdersPage() {
  return (
    <ShoppingShell requireAuth requiredRole="producer">
      {() => <ProducerOrdersContent />}
    </ShoppingShell>
  );
}

