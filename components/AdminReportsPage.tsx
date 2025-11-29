'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getStoredTokens } from "@/lib/auth/tokens";
import { apiFetch, getApiBase } from "@/lib/api";
import ShoppingShell from "@/components/ShoppingShell";

interface ReportFileItem {
  name: string;
  format: string;
  size_bytes: number;
  url: string; // absolute path on backend (mounted at /reports)
}

interface SummaryRead {
  period_start: string;
  period_end: string;
  total_orders: number;
  total_revenue_cents: number;
  total_items_sold: number;
  average_order_value_cents: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AdminReportsContent() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryRead | null>(null);
  const [files, setFiles] = useState<ReportFileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void Promise.all([
      apiFetch<SummaryRead>("/admin/reports/summary", { authToken: tokens.accessToken }),
      apiFetch<{ items: ReportFileItem[] }>("/admin/reports/files", { authToken: tokens.accessToken })
    ])
      .then(([summaryRes, filesRes]) => {
        setSummary(summaryRes);
        setFiles(filesRes.items);
      })
      .catch((err) => {
        console.error("[AdminReportsPage] Failed to load reports", err);
        setError("Impossible de charger les rapports.");
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const apiBase = getApiBase();

  const generateReport = async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens) return;
      const params = new URLSearchParams();
      if (start) params.set('period_start', start);
      if (end) params.set('period_end', end);
      await apiFetch(`/admin/reports/generate?${params.toString()}`, { method: 'POST', authToken: tokens.accessToken });
      // Refresh files and summary
      const [summaryRes, filesRes] = await Promise.all([
        apiFetch<SummaryRead>("/admin/reports/summary", { authToken: tokens.accessToken, params: { period_start: start || undefined, period_end: end || undefined } }),
        apiFetch<{ items: ReportFileItem[] }>("/admin/reports/files", { authToken: tokens.accessToken })
      ]);
      setSummary(summaryRes);
      setFiles(filesRes.items);
    } catch (e) {
      setError("Echec de la génération du rapport.");
    }
  };

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/">Accueil</Link>
        {" / Admin / Rapports"}
      </nav>

      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Administration</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Rapports</h1>
            <p className="muted">Consultez le résumé des ventes et téléchargez les rapports générés.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}

          {isLoading ? (
            <p className="muted">Chargement...</p>
          ) : (
            <>
              {summary ? (
                <div className="card" style={{ gap: "var(--space-2)" }}>
                  <strong>Période</strong>
                  <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                    {new Date(summary.period_start).toLocaleDateString("fr-FR")} → {new Date(summary.period_end).toLocaleDateString("fr-FR")}
                  </div>
                  <div style={{ display: "grid", gap: "var(--space-1)" }}>
                    <div>Total commandes: {summary.total_orders}</div>
                    <div>Revenu total (centimes): {summary.total_revenue_cents}</div>
                    <div>Articles vendus: {summary.total_items_sold}</div>
                    <div>Panier moyen (centimes): {summary.average_order_value_cents}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
                    <input className="input" type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
                    <input className="input" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
                    <button className="btn btn--primary" type="button" onClick={generateReport}>Générer & actualiser</button>
                  </div>
                </div>
              ) : null}

              <div className="card" style={{ gap: "var(--space-2)" }}>
                <strong>Fichiers disponibles</strong>
                {files.length === 0 ? (
                  <p className="muted">Aucun rapport généré pour le moment.</p>
                ) : (
                  <div className="grid" style={{ gap: "var(--space-2)" }}>
                    {files.map((file) => (
                      <div key={file.name} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                        <div>
                          <div>{file.name}</div>
                          <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                            {file.format.toUpperCase()} · {formatBytes(file.size_bytes)}
                          </div>
                        </div>
                        <a className="btn btn--ghost" href={`${apiBase}${file.url}`} target="_blank" rel="noreferrer">
                          Télécharger
                        </a>
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

export default function AdminReportsPage() {
  return (
    <ShoppingShell requireAuth requiredRole="admin">
      {() => <AdminReportsContent />}
    </ShoppingShell>
  );
}
