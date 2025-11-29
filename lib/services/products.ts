import { apiFetch } from "@/lib/api";
import { slugify } from "@/lib/slugify";
import type { Product } from "@/lib/types";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/data/products";

interface ProductImageRead {
  url: string;
  is_primary: boolean;
}

interface ProductRead {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  region: string | null;
  origin: string | null;
  dlc_date: string | null;
  impact_co2_g: number | null;
  price_cents: number;
  promo_price_cents: number | null;
  stock: number;
  status: string;
  is_published: boolean;
  images: ProductImageRead[];
}

interface ProductListResponse {
  items: ProductRead[];
  total: number;
  limit: number;
  offset: number;
}

export interface FetchProductsParams {
  query?: string;
  category?: string;
  region?: string;
  dlcWithinDays?: number;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListResult> {
  const apiParams = {
    q: params.query,
    category: params.category,
    region: params.region,
    dlc_lte_days: params.dlcWithinDays,
    price_min: params.priceMin,
    price_max: params.priceMax,
    limit: params.limit,
    offset: params.offset,
    sort: params.sort
  };

  try {
    const response = await apiFetch<ProductListResponse>("/products", {
      params: apiParams
    });
    return {
      items: response.items.map(mapProductFromApi),
      total: response.total,
      limit: response.limit,
      offset: response.offset
    };
  } catch (error) {
    console.warn("[products] falling back to local mock data", error);
    const fallbackItems = FALLBACK_PRODUCTS;
    return {
      items: fallbackItems,
      total: fallbackItems.length,
      limit: fallbackItems.length,
      offset: 0
    };
  }
}

export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const response = await apiFetch<ProductRead>(`/products/${id}`);
    return mapProductFromApi(response);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

export function getProductIdFromSlug(slug: string): number | null {
  const [first] = slug.split("-");
  const id = Number(first);
  return Number.isFinite(id) ? id : null;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const productId = getProductIdFromSlug(slug);
  if (!productId) {
    return null;
  }
  return fetchProductById(productId);
}

export function mapProductFromApi(product: ProductRead): Product {
  const images = product.images.length > 0 ? product.images : [];
  const primaryImage =
    images.find((img) => img.is_primary)?.url ??
    images[0]?.url ??
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop";

  return {
    id: product.id,
    slug: buildProductSlug(product),
    name: product.title,
    price: mapPrice(product),
    region: product.region ?? "France",
    category: product.category ?? "Autres",
    availability: product.stock > 0 ? "normal" : "surplus",
    co2Saved: mapCo2(product.impact_co2_g),
    dlcDays: mapDlcDays(product.dlc_date),
    unit: product.origin ?? "Unite",
    image: primaryImage,
    description: product.description ?? "",
    images: images.map((img) => ({ url: img.url, isPrimary: img.is_primary })),
    origin: product.origin,
    stock: product.stock,
    status: product.status,
    isPublished: product.is_published,
    impactCo2Grams: product.impact_co2_g,
    priceCents: product.price_cents,
    promoPriceCents: product.promo_price_cents
  };
}

export function buildProductSlug(product: ProductRead): string {
  return slugify(`${product.id}-${product.title}`);
}

function mapPrice(product: ProductRead): number {
  const cents = product.promo_price_cents ?? product.price_cents;
  return Math.round(cents) / 100;
}

function mapCo2(value: number | null): number {
  if (value == null) {
    return 0;
  }
  return Math.max(Math.round(value) / 1000, 0);
}

function mapDlcDays(dlcDate: string | null): number {
  if (!dlcDate) {
    return 0;
  }
  const today = new Date();
  const dlc = new Date(dlcDate);
  const diff = Math.ceil((dlc.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
