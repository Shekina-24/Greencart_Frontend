import type { Product } from "@/lib/types";
import Modal from "./Modal";
import ProductDetailsContent from "./ProductDetailsContent";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductModalProps) {
  if (!product) {
    return null;
  }

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      actions={
        <button
          className="btn btn--primary"
          type="button"
          disabled={isOutOfStock}
          aria-disabled={isOutOfStock}
          onClick={() => {
            if (!isOutOfStock) {
              onAddToCart(product);
            }
          }}
        >
          {isOutOfStock ? "Rupture" : "Ajouter au panier"}
        </button>
      }
    >
      <ProductDetailsContent product={product} />
    </Modal>
  );
}
