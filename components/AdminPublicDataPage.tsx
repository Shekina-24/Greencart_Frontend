'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getStoredTokens } from "@/lib/auth/tokens";
import { useAuth } from "@/hooks/useAuth";
import { fetchPublicDatasets, uploadPublicDataset, type PublicDataset } from "@/lib/services/publicData";
import ShoppingShell from "@/components/ShoppingShell";

const DATASET_LABELS: Record<string, string> = {
  producers: "Producteurs locaux",
  consumption: "Habitudes de consommation",
  waste: "Gaspillage / acteurs anti-gaspi"
};

function formatBytes(size: number): string {
  if (!size) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(size) / Math.log(1024)));
  return `${(size / Math.pow(1024, idx)).toFixed(1)} ${units[idx]}`;
}

function DatasetCard({ dataset, onUpload }: { dataset: PublicDataset; onUpload: (file: File) => Promise<void> }) {
  const label = DATASET_LABELS[dataset.dataset] ?? dataset.dataset;
  const updated = dataset.updatedAt ? new Date(dataset.updatedAt * 1000) : null;

  return (
    <div className="card" style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div>
          <strong>{label}</strong>
          <div className="muted" style={{ fontSize: "var(--fs-small)" }}>{dataset.dataset}</div>
        </div>
        <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
          {dataset.exists ? (
            <>
              {dataset.count} entrées • {formatBytes(dataset.sizeBytes)} • {updated ? `MAJ ${updated.toLocaleDateString("fr-FR")}` : "date inconnue"}
            </>
          ) : "Aucune donnée importée"}
        </div>
        <label className="btn btn--ghost" style={{ marginLeft: "auto" }}>
          Importer un CSV
          <input
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await onUpload(file);
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>

      {dataset.sample && dataset.sample.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                {Object.keys(dataset.sample[0]).slice(0, 4).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.sample.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(dataset.sample[0]).slice(0, 4).map((key) => (
                    <td key={key}>{String((row as Record<string, unknown>)[key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>Pas encore d’échantillon pour ce jeu.</p>
      )}

      {dataset.dataset === "producers" ? (
        <div className="alert alert--info" style={{ margin: 0 }}>
          Endpoint public disponible : <code>/api/v1/public/producers</code> (utilisable côté front pour cartes/filters).
        </div>
      ) : null}
    </div>
  );
}

function AdminPublicDataContent() {
  const [datasets, setDatasets] = useState<PublicDataset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadDatasets = async () => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPublicDatasets(tokens.accessToken);
      setDatasets(res.items);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données publiques.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDatasets();
  }, []);

  const handleUpload = (datasetKey: string) => async (file: File) => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await uploadPublicDataset(tokens.accessToken, datasetKey, file);
      setDatasets((cur) => {
        const others = cur.filter((d) => d.dataset !== datasetKey);
        return [...others, updated].sort((a, b) => a.dataset.localeCompare(b.dataset));
      });
    } catch (err) {
      console.error(err);
      setError("Import impossible. Vérifiez le CSV.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedDatasets = useMemo(() => datasets.slice().sort((a, b) => a.dataset.localeCompare(b.dataset)), [datasets]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/">Accueil</Link>
        {" / Admin / Données publiques"}
      </nav>

      <section className="section">
        <div className="grid" style={{ gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Administration</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Données publiques</h1>
            <p className="muted">Import CSV, prévisualisation et publication d’API publiques pour les jeux producteurs/conso/gaspillage.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}
          {isLoading ? <p className="muted">Chargement...</p> : null}

          <div className="grid" style={{ gap: "var(--space-3)" }}>
            {sortedDatasets.map((dataset) => (
              <DatasetCard key={dataset.dataset} dataset={dataset} onUpload={handleUpload(dataset.dataset)} />
            ))}
          </div>

          <div className="alert alert--info">
            Tips : utilisez ces données pour alimenter les filtres région/“Réseau de producteurs” sur le front. Endpoint public actuel : <code>/api/v1/public/producers</code>.
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AdminPublicDataPage() {
  return (
    <ShoppingShell requireAuth requiredRole="admin">
      {() => <AdminPublicDataContent />}
    </ShoppingShell>
  );
}
