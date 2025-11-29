'use client';

import { FormEvent, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { getStoredTokens } from "@/lib/auth/tokens";
import type { Review } from "@/lib/types";
import { createReview, fetchProductReviews, updateReview as apiUpdateReview, deleteReview as apiDeleteReview } from "@/lib/services/reviews";
import { fetchOrders } from "@/lib/services/orders";
import { useAuth } from "@/hooks/useAuth";

interface ProductReviewsProps {
  productId: number;
  initialReviews: Review[];
  totalReviews: number;
  onRequireAuth: (mode: "login" | "register") => void;
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Publie",
  pending: "En attente de moderation",
  rejected: "Rejete"
};

function formatDate(input: string): string {
  const date = new Date(input);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export default function ProductReviews({
  productId,
  initialReviews,
  totalReviews,
  onRequireAuth
}: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialReviews.length < totalReviews);
  const [offset, setOffset] = useState(initialReviews.length);

  const approvedReviews = useMemo(
    () => reviews.filter((review) => review.status !== "rejected"),
    [reviews]
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState<number>(5);
  const [editingComment, setEditingComment] = useState<string>("");

  const findEligibleOrderId = async (): Promise<number | null> => {
    const tokens = getStoredTokens();
    if (!tokens) return null;
    try {
      const resp = await fetchOrders(tokens.accessToken, { limit: 50, offset: 0 });
      const match = resp.items.find((o) => (o.status === 'paid' || o.status === 'completed') && o.lines.some((l) => l.productId === productId));
      return match ? match.id : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      onRequireAuth("login");
      return;
    }

    const tokens = getStoredTokens();
    if (!tokens) {
      onRequireAuth("login");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = await findEligibleOrderId();
      const createdReview = await createReview(
        {
          product_id: productId,
          rating,
          comment,
          order_id: orderId ?? undefined
        },
        tokens.accessToken
      );
      setReviews((current) => [createdReview, ...current]);
      setComment("");
      setRating(5);
      setSuccess(
        createdReview.status === "approved"
          ? "Votre avis est publie. Merci !"
          : "Votre avis est en attente de moderation."
      );
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        const payload = (submissionError as Error & { payload?: unknown }).payload;
        if (payload && typeof payload === "object" && "detail" in payload) {
          const detail = (payload as { detail?: unknown }).detail;
          setError(typeof detail === "string" ? detail : "Impossible d'enregistrer votre avis.");
        } else {
          setError(submissionError.message);
        }
      } else {
        setError("Impossible d'enregistrer votre avis.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setEditingRating(r.rating);
    setEditingComment(r.comment ?? "");
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const tokens = getStoredTokens();
    if (!tokens) {
      onRequireAuth("login");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const orderId = await findEligibleOrderId();
      const updated = await apiUpdateReview(editingId, { product_id: productId, rating: editingRating, comment: editingComment, order_id: orderId ?? undefined }, tokens.accessToken);
      setReviews((cur) => cur.map((r) => (r.id === updated.id ? updated : r)));
      setEditingId(null);
      setSuccess(updated.status === 'approved' ? 'Votre avis a été mis à jour.' : "Votre avis édité est en attente de modération.");
    } catch (e) {
      setError("Impossible de mettre à jour votre avis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeReview = async (id: number) => {
    const tokens = getStoredTokens();
    if (!tokens) {
      onRequireAuth("login");
      return;
    }
    try {
      await apiDeleteReview(id, tokens.accessToken);
      setReviews((cur) => cur.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible");
    }
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const resp = await fetchProductReviews(productId, { limit: 20, offset });
      setReviews((cur) => [...cur, ...resp.items]);
      const next = offset + resp.items.length;
      setOffset(next);
      setHasMore(next < resp.total);
    } catch {
      // ignore for now
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="section" id="avis">
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <div>
          <h2>Avis consommateurs</h2>
          <p className="muted">
            {approvedReviews.length} avis publies (sur {totalReviews}). Les avis sont valides pour limiter les faux
            retours.
          </p>
        </div>

        {approvedReviews.length > 0 ? (
          <div className="grid" style={{ gap: "var(--space-3)" }}>
            {approvedReviews.map((review) => (
              <article key={review.id} className="card" style={{ gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <strong>Note {review.rating}/5</strong>
                  <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
                    {STATUS_LABEL[review.status] ?? review.status} - {formatDate(review.createdAt)}
                  </span>
                </div>
                {editingId === review.id ? (
                  <div className="grid" style={{ gap: '8px' }}>
                    <div className="input-label">Modifier la note</div>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {[1,2,3,4,5].map((v) => (
                        <button key={v} type="button" className="btn btn--ghost" onClick={() => setEditingRating(v)} aria-label={`Choisir ${v} sur 5`}>
                          <Star size={18} strokeWidth={1.5} fill={v <= editingRating ? 'currentColor' : 'transparent'} />
                        </button>
                      ))}
                    </div>
                    <textarea className="textarea" rows={3} value={editingComment} onChange={(e)=>setEditingComment(e.target.value)} />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn--primary" type="button" onClick={submitEdit} disabled={isSubmitting}>Enregistrer</button>
                      <button className="btn btn--ghost" type="button" onClick={()=>setEditingId(null)} disabled={isSubmitting}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {review.comment ? <p>{review.comment}</p> : null}
                    {user && user.id === review.userId ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--ghost" type="button" onClick={()=>startEdit(review)}>Modifier</button>
                        <button className="btn btn--danger" type="button" onClick={()=>removeReview(review.id)}>Supprimer</button>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Encore aucun avis publie. Soyez le premier a partager votre retour !</p>
        )}

        {hasMore ? (
          <div>
            <button className="btn btn--ghost" type="button" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Chargement..." : "Voir plus d\' avis"}
            </button>
          </div>
        ) : null}

        <div className="card" style={{ gap: "var(--space-3)" }}>
          <div>
            <strong>Laisser un avis</strong>
            <p className="muted">
              Notez votre experience produit (la moderation verifie la presence d&apos;une commande associee).
            </p>
          </div>

          <form className="grid" style={{ gap: "var(--space-3)" }} onSubmit={handleSubmit}>
            <div>
              <div className="input-label">Note</div>
              <div style={{ display: "inline-flex", gap: "6px" }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="btn btn--ghost"
                    aria-label={`Choisir ${value} sur 5`}
                    onClick={() => setRating(value)}
                  >
                    <Star size={18} strokeWidth={1.5} fill={value <= rating ? "currentColor" : "transparent"} />
                  </button>
                ))}
              </div>
            </div>

            <label className="input-label">
              Commentaire (optionnel)
              <textarea
                className="textarea"
                placeholder="Partagez les points positifs et les ameliorations possibles."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                maxLength={1000}
              />
            </label>

            {error ? (
              <p style={{ color: "var(--gc-danger)", margin: 0, fontSize: "var(--fs-small)" }}>{error}</p>
            ) : null}
            {success ? (
              <p style={{ color: "var(--gc-success)", margin: 0, fontSize: "var(--fs-small)" }}>{success}</p>
            ) : null}

            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
              </button>
              {!user ? (
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => onRequireAuth("login")}
                >
                  Se connecter
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
