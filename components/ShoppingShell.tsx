'use client';

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingExperience, type ShoppingExperience } from "@/hooks/useShoppingExperience";
import type { CatalogueFilters } from "@/lib/types";
import AuthModal from "./AuthModal";
import CartModal from "./CartModal";
import Footer from "./Footer";
import Header from "./Header";
import ProductModal from "./ProductModal";
import { trackBeginCheckout } from "@/lib/analyticsEvents";

interface ShoppingShellProps {
  children: (experience: ShoppingExperience) => ReactNode;
  initialFilters?: Partial<CatalogueFilters>;
  requireAuth?: boolean;
  requiredRole?: "consumer" | "producer" | "admin" | Array<"consumer" | "producer" | "admin">;
}

export default function ShoppingShell({ children, initialFilters, requireAuth = false, requiredRole }: ShoppingShellProps) {
  const experience = useShoppingExperience(initialFilters);
  const router = useRouter();
  const { user, logout, isAuthenticating } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { authModal, closeAuthModal } = experience;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user && authModal !== null) {
      closeAuthModal();
    }
  }, [user, authModal, closeAuthModal]);

  // Access guard: open auth modal if required and user not present
  useEffect(() => {
    if (requireAuth && !isAuthenticating && !user && authModal !== "login") {
      experience.openAuthModal("login");
    }
  }, [requireAuth, isAuthenticating, user, authModal, experience]);

  const anyModalOpen =
    experience.isCartOpen || authModal !== null || experience.selectedProduct !== null;

  useEffect(() => {
    if (!anyModalOpen) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [anyModalOpen]);

  const isRoleAllowed = useMemo(() => {
    if (!requiredRole) return true;
    if (!user) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }, [user, requiredRole]);

  const showProtectedNotice = !isAuthenticating && requireAuth && (!user || !isRoleAllowed);
  const canRenderChildren = !showProtectedNotice;

  return (
    <>
      <Header
        cartCount={experience.cartCount}
        onOpenCart={experience.openCart}
        onOpenLogin={() => experience.openAuthModal("login")}
        onOpenRegister={() => experience.openAuthModal("register")}
        onLogout={logout}
        isScrolled={isScrolled}
        user={user}
        isAuthenticating={isAuthenticating}
      />

      {isAuthenticating ? (
        <main className="container" style={{ display: "grid", gap: "var(--space-12)" }} aria-busy="true">
          <section className="section">
            <div className="skeleton-block" style={{ height: 200 }} />
          </section>
        </main>
      ) : canRenderChildren ? (
        children(experience)
      ) : (
        <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
          <section className="section">
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              <div>
                <div className="badge badge--impact">Accès protégé</div>
                <h1 style={{ marginTop: "var(--space-2)" }}>Veuillez vous connecter</h1>
                <p className="muted">Cette section est réservée aux utilisateurs authentifiés{requiredRole ? " avec le rôle approprié" : ""}.</p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <button className="btn btn--primary" type="button" onClick={() => experience.openAuthModal("login")}>
                  Se connecter
                </button>
                <button className="btn btn--secondary" type="button" onClick={() => experience.openAuthModal("register")}>
                  Créer un compte
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      <Footer />

      <CartModal
        isOpen={experience.isCartOpen}
        onClose={experience.closeCart}
        items={experience.cartItems}
        totalPrice={experience.cartTotals.totalPrice}
        totalCo2={experience.cartTotals.totalCo2}
        onDecrease={experience.decreaseItem}
        onIncrease={experience.increaseItem}
        onRemove={experience.removeItem}
        onEmpty={experience.emptyCart}
        onCheckout={() => {
          try {
            const items = experience.cartItems.map((i) => ({ id: i.id, quantity: i.quantity, priceCents: i.priceCents ?? null }));
            const totalCents = Math.round(experience.cartTotals.totalPrice * 100);
            trackBeginCheckout({ totalCents, items });
          } catch {}
          experience.closeCart();
          router.push("/checkout");
        }}
        isProcessing={experience.isCartSyncing}
        errorMessage={experience.cartError}
      />

      <ProductModal
        isOpen={experience.selectedProduct !== null}
        product={experience.selectedProduct}
        onClose={experience.closeProduct}
        onAddToCart={(product) => {
          experience.addToCart(product);
          experience.closeProduct();
        }}
      />

      <AuthModal
        mode={authModal === "register" ? "register" : "login"}
        isOpen={authModal !== null && !user}
        onClose={closeAuthModal}
      />
    </>
  );
}
