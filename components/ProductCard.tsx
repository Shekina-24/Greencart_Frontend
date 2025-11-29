import { Clock3, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

function getAvailabilityBadge(availability: Product["availability"]) {
  if (availability === "surplus") {
    return { label: "Lot anti-gaspi", className: "badge badge--promo" };
  }
  return { label: "Producteur local", className: "badge" };
}

function getDlcBadge(days: number) {
  if (days <= 3) {
    return {
      label: `DLC ${days} j`,
      className: "badge badge--alert",
      message: "DLC proche : pensez a consommer rapidement."
    };
  }
  if (days <= 7) {
    return {
      label: `DLC ${days} j`,
      className: "badge badge--promo",
      message: "A consommer cette semaine."
    };
  }
  return {
    label: `DLC ${days} j`,
    className: "badge badge--impact",
    message: "DLC confortable : stockez quelques jours."
  };
}

function formatImpact(product: Product): string {
  const grams = product.impactCo2Grams != null ? product.impactCo2Grams : Math.max(0, Math.round(product.co2Saved * 1000));
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg CO2e evites`;
  }
  return `${grams} g CO2e evites`;
}

export default function ProductCard({
  product,
  onAddToCart,
  onOpenDetails
}: ProductCardProps) {
  const availabilityBadge = getAvailabilityBadge(product.availability);
  const dlcBadge = getDlcBadge(product.dlcDays);
  const productHref = `/produits/${product.slug}`;
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <article className="card product" aria-label={`Produit ${product.name}`}>
      <Link href={productHref} aria-label={`Consulter ${product.name}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={480}
          height={320}
          sizes="(max-width: 900px) 100vw, 320px"
          className="product-image"
        />
      </Link>

      <div className="product__heading">
        <Link href={productHref} className="product__title">
          {product.name}
        </Link>
        <span className={availabilityBadge.className}>{availabilityBadge.label}</span>
      </div>

      <div className="product__meta">
        <span>
          {product.category} - {product.region} - {product.unit}
        </span>
      </div>

      <div className="product__pricing">
        <strong>{product.price.toFixed(2)} EUR</strong>
        <div className="product__impact">
          <Leaf size={16} strokeWidth={1.5} aria-hidden />
          <span>{formatImpact(product)}</span>
        </div>
        {typeof product.stock === "number" ? (
          <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
            Stock: {product.stock > 0 ? product.stock : 0}
          </span>
        ) : null}
      </div>

      <div className="product__details">
        <div className="product__dlc">
          <div className="product__dlc-label">
            <Clock3 size={16} strokeWidth={1.5} aria-hidden />
            <span>{dlcBadge.label}</span>
          </div>
          <span className={dlcBadge.className} aria-live="polite">
            {dlcBadge.message}
          </span>
        </div>
        <p className="product__description">{product.description}</p>
        <Link href={productHref} className="product__link">
          Voir la fiche complete
        </Link>
      </div>

      <div className="product__actions">
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          aria-disabled={isOutOfStock}
          title={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
        >
          {isOutOfStock ? "Rupture" : "Ajouter au panier"}
        </button>
        <button className="btn btn--secondary" type="button" onClick={() => onOpenDetails(product)}>
          Details rapides
        </button>
      </div>
    </article>
  );
}
