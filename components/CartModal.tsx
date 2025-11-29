import { Leaf, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import Modal from "./Modal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  totalCo2: number;
  onDecrease: (id: number) => void;
  onIncrease: (id: number) => void;
  onRemove: (id: number) => void;
  onEmpty: () => void;
  onCheckout: () => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  totalPrice,
  totalCo2,
  onDecrease,
  onIncrease,
  onRemove,
  onEmpty,
  onCheckout,
  isProcessing = false,
  errorMessage = null
}: CartModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mon panier"
      actions={
        <>
          <button className="btn" type="button" onClick={onClose}>
            Continuer mes achats
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || isProcessing}
          >
            {isProcessing ? "Traitement..." : "Passer au paiement"}
          </button>
        </>
      }
    >
      {errorMessage ? (
        <div className="alert alert--warning" role="status">
          {errorMessage}
        </div>
      ) : null}

      <div className="cart-summary">
        <strong>Total : {totalPrice.toFixed(2)} EUR</strong>
        <button className="btn btn--ghost" type="button" onClick={onEmpty}>
          Vider
        </button>
      </div>

      <div className="cart-list">
        {items.length === 0 ? (
          <p className="muted">Votre panier est vide pour l&apos;instant.</p>
        ) : (
          items.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="cart-item__header">
                <strong>{item.name}</strong>
                <span className="muted">
                  {item.region} - {item.unit}
                </span>
              </div>
              <div className="cart-item__controls">
                <div className="cart-item__quantity">
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => onDecrease(item.id)}
                    aria-label="Diminuer la quantite"
                  >
                    <Minus size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                  <span>
                    {item.quantity} x {item.price.toFixed(2)} EUR
                  </span>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => onIncrease(item.id)}
                    aria-label="Augmenter la quantite"
                  >
                    <Plus size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
                <button className="btn btn--danger" type="button" onClick={() => onRemove(item.id)}>
                  <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                  Retirer
                </button>
              </div>
              <div className="cart-item__impact">
                <Leaf size={16} strokeWidth={1.5} aria-hidden />
                <span>Impact evite : {(item.co2Saved * item.quantity).toFixed(1)} kg CO2e</span>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="cart-footer">
        <span className="muted">Total CO2e evite : {totalCo2.toFixed(1)} kg</span>
        <span className="muted">Livraison responsable incluse (demo)</span>
      </div>
    </Modal>
  );
}
