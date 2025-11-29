'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ShoppingExperience } from "@/hooks/useShoppingExperience";
import ShoppingShell from "./ShoppingShell";

function formatPrice(value: number): string {
  return `${value.toFixed(2)} EUR`;
}

function CheckoutContent({ experience }: { experience: ShoppingExperience }) {
  const { user } = useAuth();
  const openAuthModal = experience.openAuthModal;

  useEffect(() => {
    if (!user) {
      openAuthModal("login");
    }
  }, [user, openAuthModal]);

  const cartEmpty = experience.cartItems.length === 0;
  const disableActions = experience.isCartSyncing || cartEmpty;

  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: "var(--fs-small)" }}>
        <Link className="muted" href="/catalogue">
          Catalogue
        </Link>
        {" / Checkout"}
      </nav>

      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Etape finale</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Confirmation de commande</h1>
            <p className="muted">
              Verifiez votre panier, renseignez les informations de livraison (simule) et validez.
            </p>
          </div>

          {experience.checkoutSuccess ? (
            <div className="alert alert--success" role="status">
              {experience.checkoutSuccess}
            </div>
          ) : null}

          {experience.cartError ? (
            <div className="alert alert--warning" role="status">
              {experience.cartError}
            </div>
          ) : null}

          <div className="card" style={{ gap: "var(--space-3)" }}>
            <strong>Recapitulatif panier</strong>
            {cartEmpty ? (
              <p className="muted">Votre panier est vide.</p>
            ) : (
              <div className="grid" style={{ gap: "var(--space-2)" }}>
                {experience.cartItems.map((item) => (
                  <div key={item.id} className="grid" style={{ gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                      <span>{item.name}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                      Quantite {item.quantity} - Impact evite {(item.co2Saved * item.quantity).toFixed(1)} kg CO2e
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
              <span>Total</span>
              <span>{formatPrice(experience.cartTotals.totalPrice)}</span>
            </div>
          </div>

          <div className="card" style={{ gap: "var(--space-3)" }}>
            <strong>Coordonnees (demo)</strong>
            <div className="grid" style={{ gap: "var(--space-2)" }}>
              <input className="input" placeholder="Nom complet" defaultValue={user?.firstName ?? ""} />
              <input className="input" placeholder="Adresse de livraison" />
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <input className="input" placeholder="Code postal" style={{ flex: "1 1 140px" }} />
                <input className="input" placeholder="Ville" style={{ flex: "2 1 220px" }} />
              </div>
              <textarea className="textarea" placeholder="Instructions (optionnel)" rows={3} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <button
              className="btn btn--primary"
              type="button"
              disabled={disableActions}
              onClick={experience.handleCheckout}
            >
              {experience.isCartSyncing ? "Validation en cours..." : "Confirmer la commande"}
            </button>
            <Link className="btn btn--ghost" href="/catalogue">
              Continuer vos achats
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <ShoppingShell>
      {(experience) => <CheckoutContent experience={experience} />}
    </ShoppingShell>
  );
}
