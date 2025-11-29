'use client';

import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@/lib/types";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout?: () => void;
  user?: User | null;
  isAuthenticating?: boolean;
  isScrolled: boolean;
}

const ROLE_LABEL: Record<User["role"], string> = {
  consumer: "Consommateur",
  producer: "Producteur",
  admin: "Admin"
};

type NavLink = { label: string; href: string | { pathname: string; hash?: string } };

const BASE_NAV_LINKS: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Valeurs", href: "/valeurs" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Producteurs", href: "/producteurs" },
  { label: "Aide", href: "/aide" }
];

const ROLE_NAV_LINKS: Partial<Record<User["role"], NavLink[]>> = {
  consumer: [
    { label: "Compte", href: "/compte" },
    { label: "Avis", href: "/compte/avis" },
    { label: "Commandes", href: "/compte/commandes" },
    { label: "Impact", href: "/compte/impact" },
    { label: "Aide", href: "/aide" }
  ],
  producer: [
    { label: "Dashboard", href: "/producteurs/dashboard" },
    { label: "Mes produits", href: "/producteurs/produits" },
    { label: "Commandes", href: "/producteurs/commandes" },
    { label: "Recommandations IA", href: "/producteurs/recommandations" },
    { label: "Aide", href: "/aide" }
  ],
  admin: [
    { label: "Analytics", href: "/admin/analytics" },
    { label: "BI", href: "/admin/bi" },
    { label: "Données publiques", href: "/admin/public-data" },
    { label: "Rapports", href: "/admin/reports" },
    { label: "Utilisateurs", href: "/admin/utilisateurs" }
  ]
};

function formatUserLabel(user: User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}

export default function Header({
  cartCount,
  onOpenCart,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  user,
  isAuthenticating,
  isScrolled
}: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const roleLinks = useMemo(() => (user && user.role ? ROLE_NAV_LINKS[user.role] ?? [] : []), [user]);

  const navLinks = useMemo<NavLink[]>(() => {
    if (user?.role === "admin") {
      return roleLinks;
    }
    if (user?.role === "producer") {
      return roleLinks;
    }
    if (user?.role === "consumer") {
      return roleLinks;
    }
    return [...BASE_NAV_LINKS, ...roleLinks];
  }, [user, roleLinks]);

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="container nav">
        <div className="brand">
          <Image src="/images/logo.png" alt="Logo GreenCart" className="logo" width={44} height={44} />
          <Link href="/" className="brand-name" onClick={closeMenu}>
            GreenCart
          </Link>
          <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
              
          </span>
        </div>

        <button
          className="header-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="navigation-principale"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={22} strokeWidth={1.5} aria-hidden /> : <Menu size={22} strokeWidth={1.5} aria-hidden />}
          <span className="sr-only">{isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>

        <div className={`header-menus${isMenuOpen ? " is-open" : ""}`}>
          <nav
            id="navigation-principale"
            className="navlinks"
            role="navigation"
            aria-label="Navigation principale"
          >
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            {(user?.role === "consumer" || !user) ? (
              <button className="btn btn--ghost" type="button" onClick={() => { onOpenCart(); closeMenu(); }}>
                Mon panier ({cartCount})
              </button>
            ) : null}
            {user ? (
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                <div className="badge badge--ghost">
                  {ROLE_LABEL[user.role]}
                </div>
                <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
                  {formatUserLabel(user)}
                </span>
                <button className="btn btn--ghost" type="button" onClick={() => { onLogout?.(); closeMenu(); }} disabled={isAuthenticating}>
                  {isAuthenticating ? "Chargement..." : "Se deconnecter"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
                <button className="btn btn--ghost" type="button" onClick={() => { onOpenLogin(); closeMenu(); }}>
                  Se connecter
                </button>
                <button className="btn btn--primary" type="button" onClick={() => { onOpenRegister(); closeMenu(); }}>
                  Creer un compte
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
