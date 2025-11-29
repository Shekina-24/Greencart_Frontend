export type Availability = "surplus" | "normal";

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  region: string;
  category: string;
  availability: Availability;
  co2Saved: number;
  dlcDays: number;
  unit: string;
  image: string;
  description: string;
  images?: ProductImage[];
  origin?: string | null;
  stock?: number | null;
  status?: string | null;
  isPublished?: boolean;
  impactCo2Grams?: number | null;
  priceCents?: number;
  promoPriceCents?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export type CatalogueSort = "newest" | "price_asc" | "price_desc" | "dlc_asc";

export interface CatalogueFilters {
  category: string;
  region: string;
  availability: "" | Availability;
  query: string;
  priceMin: number | null;
  priceMax: number | null;
  dlcMaxDays: number | null;
  sort: CatalogueSort;
}

export interface DashboardMetrics {
  orders: number;
  co2: number;
  savings: number;
  weeklySavings: number;
}

export type UserRole = "consumer" | "producer" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  region: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  consentNewsletter: boolean;
  consentAnalytics: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  publishedAt: string | null;
  moderationNotes?: string | null;
}

export interface ReviewList {
  items: Review[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderLine {
  id: number;
  productId: number | null;
  productTitle: string;
  quantity: number;
  unitPriceCents: number;
  referencePriceCents?: number | null;
  subtotalCents: number;
  impactCo2Grams: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  status: string;
  currency: string;
  totalAmountCents: number;
  totalItems: number;
  totalImpactCo2Grams: number;
  paymentReference: string | null;
  paymentProvider: string | null;
  idempotencyKey: string | null;
  placedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lines: OrderLine[];
}

export interface OrderList {
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface AnalyticsTopProduct {
  productId: number | null;
  productTitle?: string | null;
  units: number;
  revenueCents: number;
}

export interface AnalyticsSummary {
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  totalRevenueCents: number;
  totalItemsSold: number;
  averageOrderValueCents: number;
  topProducts: AnalyticsTopProduct[];
}

// Producer analytics/insights
export interface ProducerTopProduct {
  productId: number;
  title: string;
  revenueCents: number;
  unitsSold: number;
  averageRating?: number | null;
}

export interface ProducerInsights {
  totalOrders: number;
  totalRevenueCents: number;
  totalItemsSold: number;
  averageOrderValueCents: number;
  totalImpactCo2Grams: number;
  topProducts: ProducerTopProduct[];
}

// Producer orders (flattened per producer scope)
export interface ProducerOrderLine {
  id: number;
  orderId: number;
  productId: number | null;
  productTitle: string;
  quantity: number;
  unitPriceCents: number;
  referencePriceCents?: number | null;
  subtotalCents: number;
  createdAt: string;
}

export interface ProducerOrder {
  orderId: number;
  status: string;
  customerId: number;
  customerEmail: string;
  createdAt: string;
  totalAmountCents: number;
  lines: ProducerOrderLine[];
}

export interface ProducerOrderList {
  items: ProducerOrder[];
  total: number;
  limit: number;
  offset: number;
}
