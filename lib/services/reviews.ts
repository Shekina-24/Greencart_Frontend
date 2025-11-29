import { apiFetch } from "@/lib/api";
import type { Review, ReviewList } from "@/lib/types";

interface ReviewRead {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
  moderation_notes: string | null;
}

interface ReviewListResponse {
  items: ReviewRead[];
  total: number;
  limit: number;
  offset: number;
}

interface CreateReviewPayload {
  product_id: number;
  rating: number;
  comment?: string | null;
  order_id?: number | null;
}

export async function fetchProductReviews(
  productId: number,
  params: { limit?: number; offset?: number } = {}
): Promise<ReviewList> {
  const response = await apiFetch<ReviewListResponse>(`/reviews/product/${productId}`, {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    }
  });

  return {
    items: response.items.map(mapReviewFromApi),
    total: response.total,
    limit: response.limit,
    offset: response.offset
  };
}

export async function createReview(
  payload: CreateReviewPayload,
  authToken: string
): Promise<Review> {
  const response = await apiFetch<ReviewRead>("/reviews", {
    method: "POST",
    body: JSON.stringify({
      product_id: payload.product_id,
      rating: payload.rating,
      comment: payload.comment ?? null,
      order_id: payload.order_id ?? null
    }),
    authToken
  });
  return mapReviewFromApi(response);
}

export async function updateReview(
  reviewId: number,
  payload: { product_id: number; rating: number; comment?: string | null; order_id?: number | null },
  authToken: string
): Promise<Review> {
  const response = await apiFetch<ReviewRead>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({
      product_id: payload.product_id,
      rating: payload.rating,
      comment: payload.comment ?? null,
      order_id: payload.order_id ?? null
    }),
    authToken
  });
  return mapReviewFromApi(response);
}

export async function deleteReview(reviewId: number, authToken: string): Promise<void> {
  await apiFetch(`/reviews/${reviewId}`, {
    method: "DELETE",
    authToken
  });
}

export async function fetchMyReviews(
  authToken: string,
  params: { limit?: number; offset?: number } = {}
): Promise<ReviewList> {
  const response = await apiFetch<ReviewListResponse>("/reviews/me", {
    authToken,
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    }
  });
  return {
    items: response.items.map(mapReviewFromApi),
    total: response.total,
    limit: response.limit,
    offset: response.offset
  };
}

function mapReviewFromApi(review: ReviewRead): Review {
  return {
    id: review.id,
    productId: review.product_id,
    userId: review.user_id,
    rating: review.rating,
    comment: review.comment,
    status: review.status as Review["status"],
    createdAt: review.created_at,
    publishedAt: review.published_at,
    moderationNotes: review.moderation_notes
  };
}
