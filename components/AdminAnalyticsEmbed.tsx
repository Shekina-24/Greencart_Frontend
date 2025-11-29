'use client';

import { useMemo, useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchAdminAnalyticsEmbedToken, type AnalyticsEmbedFilter, type AnalyticsEmbedToken } from "@/lib/services/analytics";

interface Props {
  title?: string;
}

function buildIframeUrl(embed: AnalyticsEmbedToken | null): string | null {
  if (!embed) return null;
  try {
    const url = new URL(embed.embedUrl);
    if (embed.token) {
      url.searchParams.set("access_token", embed.token);
    }
    return url.toString();
  } catch {
    return embed.embedUrl;
  }
}

export default function AdminAnalyticsEmbed({ title = "Tableau de bord Power BI" }: Props) {
  const [filters, setFilters] = useState<AnalyticsEmbedFilter>({});
  const [embed, setEmbed] = useState<AnalyticsEmbedToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const iframeUrl = useMemo(() => buildIframeUrl(embed), [embed]);

  const loadEmbed = async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setError("Authentification requise.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAdminAnalyticsEmbedToken(tokens.accessToken, filters);
      setEmbed(result);
    } catch (err) {
      console.error("[AdminAnalyticsEmbed] Failed to fetch embed token", err);
      setError("Impossible de récupérer le tableau de bord externe.");
      setEmbed(null);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { flex: "1 1 180px", minWidth: 160 };

  return (
    <section className="section">
      <div className="grid" style={{ gap: "var(--space-4)" }}>
        <div>
          <div className="badge badge--impact">BI externe</div>
          <h2 style={{ marginTop: "var(--space-1)" }}>{title}</h2>
          <p className="muted" style={{ margin: 0 }}>Tableau de bord Power BI avec filtres région / producteur / période.</p>
        </div>

        <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Région (optionnel)"
            value={filters.region ?? ""}
            style={inputStyle}
            onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value || undefined }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Producteur ID"
            value={filters.producerId ?? ""}
            style={{ flex: "1 1 150px", minWidth: 140 }}
            onChange={(e) => setFilters((f) => ({ ...f, producerId: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            className="input"
            type="date"
            value={filters.dateStart ?? ""}
            style={{ flex: "1 1 150px", minWidth: 140 }}
            onChange={(e) => setFilters((f) => ({ ...f, dateStart: e.target.value || undefined }))}
          />
          <input
            className="input"
            type="date"
            value={filters.dateEnd ?? ""}
            style={{ flex: "1 1 150px", minWidth: 140 }}
            onChange={(e) => setFilters((f) => ({ ...f, dateEnd: e.target.value || undefined }))}
          />
          <button className="btn btn--primary" type="button" onClick={loadEmbed} disabled={isLoading}>
            {isLoading ? "Chargement..." : "Charger le tableau"}
          </button>
          {embed ? (
            <div className="muted" style={{ marginLeft: "auto", fontSize: "var(--fs-small)" }}>
              Expire le {new Date(embed.expiresAt).toLocaleString("fr-FR")}
            </div>
          ) : null}
        </div>

        {error ? <div className="alert alert--warning">{error}</div> : null}

        <div className="card" style={{ minHeight: 360, height: "60vh", display: "grid" }}>
          {iframeUrl ? (
            <iframe
              title="Power BI dashboard"
              src={iframeUrl}
              style={{ width: "100%", height: "100%", minHeight: 360, border: "none" }}
              allowFullScreen
            />
          ) : (
            <p className="muted" style={{ margin: 0 }}>{isLoading ? "Chargement du tableau..." : "Cliquez sur Charger pour afficher le tableau Power BI."}</p>
          )}
        </div>
      </div>
    </section>
  );
}
