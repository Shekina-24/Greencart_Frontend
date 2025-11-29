import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface FeaturedProductsSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onExploreCatalogue: () => void;
}

export default function FeaturedProductsSection({
  products,
  onAddToCart,
  onOpenDetails,
  onExploreCatalogue
}: FeaturedProductsSectionProps) {
  return (
    <section id="produits" className="section">
      <div className="banner">
        <div>
          <h2>Lots anti-gaspi a saisir</h2>
          <p className="muted">
            Exemples issus de notre base de donnees de demonstration. Les stocks reels seront synchronises avec l&apos;ERP producteurs lors du raccordement.
          </p>
        </div>
        <button className="btn btn--secondary" type="button" onClick={onExploreCatalogue}>
          Parcourir le catalogue complet
        </button>
      </div>
      <div className="grid cards-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </section>
  );
}
