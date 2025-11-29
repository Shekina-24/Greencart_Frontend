'use client';

import Link from "next/link";
import { Leaf, MapPin, PackageOpen, Truck, Warehouse } from "lucide-react";
import { useEffect, useMemo } from "react";
import { trackAddToCart, trackViewProduct } from "@/lib/analyticsEvents";
import type { Product, Review } from "@/lib/types";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import ShoppingShell from "./ShoppingShell";
import type { ShoppingExperience } from "@/hooks/useShoppingExperience";

interface ProductPageProps {
  product: Product;
  reviews: Review[];
  reviewsTotal: number;
}

function formatPrice(product: Product): string {
  if (product.promoPriceCents != null) {
    return (product.promoPriceCents / 100).toFixed(2);
  }
  if (product.priceCents != null) {
    return (product.priceCents / 100).toFixed(2);
  }
  return product.price.toFixed(2);
}

function formatImpact(product: Product): string {
  const grams = product.impactCo2Grams != null ? product.impactCo2Grams : Math.max(0, Math.round(product.co2Saved * 1000));
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg CO2e evites`;
  }
  return `${grams} g CO2e evites`;
}

function ProductPageContent({
  product,
  reviews,
  reviewsTotal,
  experience
}: ProductPageProps & { experience: ShoppingExperience }) {
  const galleryImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images
        .slice()
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
        .map((image) => image.url);
    }
    return [product.image];
  }, [product.images, product.image]);

  useEffect(() => {
    trackViewProduct({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents ?? product.promoPriceCents ?? null,
      category: product.category,
      region: product.region
    });
  }, [product]);

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images && product.images.length > 0 ? product.images.map((i) => i.url) : [product.image],
            category: product.category,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: (product.promoPriceCents ?? product.priceCents ?? Math.round(product.price * 100)) / 100,
              availability: (typeof product.stock === 'number' && product.stock <= 0) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
            }
          })
        }}
      />
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/catalogue">
          Retour au catalogue
        </Link>
        {" / "}
        <span>{product.name}</span>
      </nav>

      <section className="section">
        <div className="grid" style={{ gap: "var(--space-6)", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <ProductGallery images={galleryImages} alt={product.name} />

          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div>
              <div className="badge badge--impact">Impact mesure</div>
              <h1 style={{ marginTop: "var(--space-2)" }}>{product.name}</h1>
              <p className="muted">
                {product.category} - {product.region}
              </p>
            </div>

            <div className="card" style={{ gap: "var(--space-3)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <strong style={{ fontSize: "1.75rem" }}>{formatPrice(product)} EUR</strong>
                {product.promoPriceCents != null ? (
                  <span className="muted" style={{ textDecoration: "line-through" }}>
                    {(product.priceCents ?? product.price * 100) / 100} EUR
                  </span>
                ) : null}
                <p>{product.description}</p>
              </div>

              <div style={{ display: "grid", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <PackageOpen size={18} strokeWidth={1.5} aria-hidden />
                  <span>{product.unit}</span>
                </div>
                {product.origin ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <MapPin size={18} strokeWidth={1.5} aria-hidden />
                    <span>{product.origin}</span>
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Leaf size={18} strokeWidth={1.5} aria-hidden />
                  <span>{formatImpact(product)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Truck size={18} strokeWidth={1.5} aria-hidden />
                  <span>DLC cible : {product.dlcDays} jour{product.dlcDays > 1 ? "s" : ""}</span>
                </div>
                {typeof product.stock === "number" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Warehouse size={18} strokeWidth={1.5} aria-hidden />
                    <span>{product.stock} unite{product.stock > 1 ? "s" : ""} disponibles</span>
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => { trackAddToCart({ id: product.id, name: product.name, quantity: 1, priceCents: product.priceCents ?? product.promoPriceCents ?? null }); experience.addToCart(product); }}
                  disabled={typeof product.stock === "number" && product.stock <= 0}
                  aria-disabled={typeof product.stock === "number" && product.stock <= 0}
                >
                  {typeof product.stock === "number" && product.stock <= 0 ? "Rupture" : "Ajouter au panier"}
                </button>
                <button className="btn btn--secondary" type="button" onClick={experience.openCart}>
                  Voir mon panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        initialReviews={reviews}
        totalReviews={reviewsTotal}
        onRequireAuth={experience.openAuthModal}
      />
    </main>
  );
}

export default function ProductPage({ product, reviews, reviewsTotal }: ProductPageProps) {
  return (
    <ShoppingShell>
      {(experience) => (
        <ProductPageContent
          product={product}
          reviews={reviews}
          reviewsTotal={reviewsTotal}
          experience={experience}
        />
      )}
    </ShoppingShell>
  );
}

