'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchMyReviews } from "@/lib/services/reviews";
import type { Review } from "@/lib/types";
import ShoppingShell from "./ShoppingShell";

function formatDate(input: string): string {
  const date = new Date(input);
  return date.toLocaleDateString("fr-FR");
}

function MyReviewsContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void fetchMyReviews(tokens.accessToken)
      .then((res) => setReviews(res.items))
      .catch(() => setError("Impossible de recuperer vos avis."))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Mon compte</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Mes avis</h1>
            <p className="muted">Historique de vos avis laisses sur les produits.</p>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}
          {isLoading ? (
            <p className="muted">Chargement...</p>
          ) : reviews.length === 0 ? (
            <p className="muted">Vous n&apos;avez pas encore laisse d&apos;avis.</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              {reviews.map((r) => (
                <article key={r.id} className="card" style={{ gap: "var(--space-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Note {r.rating}/5</strong>
                    <span className="muted" style={{ fontSize: "var(--fs-small)" }}>{formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment ? <p>{r.comment}</p> : <p className="muted">Sans commentaire</p>}
                  <div className="muted" style={{ fontSize: "var(--fs-small)" }}>Statut: {r.status}</div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function MyReviewsPage() {
  return (
    <ShoppingShell requireAuth>
      {() => <MyReviewsContent />}
    </ShoppingShell>
  );
}
