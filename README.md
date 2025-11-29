# GreenCart (Next.js App Router)

GreenCart est un MVP Next.js App Router qui illustre la plateforme de marque voulue par Lucie : anti-gaspi, circuits courts, outils producteurs et sobriete numerique. L'application expose des routes SEO (catalogue, categories, regions, fiches produits) et des espaces dedies valeurs, producteurs et FAQ.

## Demarrage rapide

```bash
npm install
npm run dev
```

Serveur local : http://localhost:3000

## Configuration

Copiez `.env.example` vers `.env.local` et renseignez vos valeurs :

- `NEXT_PUBLIC_API_BASE` : URL publique de l'API FastAPI (default `http://localhost:8000`).
- `NEXT_PUBLIC_GTM_ID` : identifiant du conteneur Google Tag Manager utilise pour GA4 / Consent Mode.

## Scripts

- `npm run dev` : mode developpement avec rechargement.
- `npm run lint` : verifications ESLint/TypeScript Next.
- `npm run build` : build production (analyse bundles + verif CWV).

## Fonctionnalites clefs

- Hero mission + KPI (CO2e, euros, producteurs) avec CTA vers catalogue et valeurs.
- Catalogue filtre (categorie, region, disponibilite, recherche) reutilisable sur `/catalogue`, `/categories/[slug]`, `/regions/[slug]`.
- Cartes produits avec badge DLC, impact CO2e, ajout panier et lien vers fiche detaillee `/produits/[slug]`.
- Modales accessibles (produit, panier, auth) partagees via `ShoppingShell`.
- Landing page marketing (`/landing`) avec hero immersif, parcours en 3 etapes, reseau producteurs et indicateurs d impact.
- Tableau de bord demo (commandes, CO2e evite, economies) + simulation hebdo.
- Espace producteur dedie (`/producteurs`) avec mise en avant des outils IA et onboarding.
- Pages valeurs (`/valeurs`) et aide FAQ (`/aide`) pour la transparence et l'accompagnement.

## Architecture

- `app/` : routes publiques (`/`, `/landing`, `/catalogue`, `/valeurs`, `/producteurs`, `/aide`, `/produits/[slug]`, `/categories/[slug]`, `/regions/[slug]`) et layout global.
- `components/` : `ShoppingShell` (header/footer + modales), sections marketing, catalogue, fiches produit, pages dediees.
- `hooks/` : `useShoppingExperience` centralise panier, filtres, modales et metriques demo.
- `lib/` : types TypeScript, helpers catalogue (slugs, resolvers) et utilitaire `slugify`.
- `data/` : catalogue de demonstration (produits avec slug, metadonnees impact).

## Sobriete numerique & accessibilite

- Budgets : JS executable < 300 KB, CSS < 100 KB, image LCP < 120 KB mobile.
- Code-splitting Next.js, `next/image` (AVIF/WebP), lazy loading et `fetchpriority` sur elements hero.
- Accessibilite : navigation clavier, roles ARIA, focus visibles, contrastes conformes.
- Performances : objectifs LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. Collecte web-vitals vers GA4 envisagee.

## Roadmap technique

1. Auth reelle (NextAuth ou BFF), gestion roles (consommateur/producteur/admin).
2. APIs catalogue, commandes, paiements (Stripe/PayGreen) + dashboards (Power BI / Tableau / Dash).
3. Integration analytics (GTM + GA4 Consent Mode) et rapports mensuels automatisees.
4. Tests automatises (Vitest/RTL + Playwright), audit sobriete (Lighthouse CI, ecoindex).
5. PWA optionnelle (lecture catalogue offline), recommandations en page, comparateur impact.

## Notes

- Contenu redige en francais ASCII pour simplifier l'internationalisation future.
- Les anciens assets statiques (`assets/`, `index.html`) sont conserves a titre de reference historique.
- Toujours lancer `npm run build` avant livraison pour valider lint, types et budgets.
