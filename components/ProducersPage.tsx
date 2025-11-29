'use client';

import ShoppingShell from "./ShoppingShell";
import ProducersSection from "./ProducersSection";

export default function ProducersPage() {
  return (
    <ShoppingShell>
      {(experience) => (
        <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
          <section className="section">
            <div>
              <div className="badge badge--impact">Espace producteur</div>
              <h1 style={{ marginTop: "var(--space-2)" }}>Rejoindre le reseau GreenCart</h1>
            </div>
            <p className="muted">
              Publiez vos lots en quelques minutes, valorisez vos invendus et accedez a des recommandations IA pour
              anticiper la demande. GreenCart fournit un accompagnement humain et des outils numeriques sobres.
            </p>
            <div className="card">
              <strong>Onboarding</strong>
              <p className="muted">
                Verification KYC simplifiee, import de vos references (CSV/ERP), configuration des seuils de prix justes
                et parametres logistiques. Accompagnement par un coach anti-gaspi.
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => experience.openAuthModal("register")}
                >
                  Demarrer mon inscription
                </button>
                <button className="btn btn--secondary" type="button" onClick={() => experience.openAuthModal("login")}>
                  Se connecter (producteurs)
                </button>
              </div>
            </div>
          </section>

          <section className="section">
            <ProducersSection onBecomeProducer={() => experience.openAuthModal("register")} />
          </section>

          <section className="section">
            <h2>Fonctionnalites clefs</h2>
            <div className="grid cards-2">
              <article className="card">
                <h3>Tableau de bord</h3>
                <p className="muted">
                  Suivi temps reel des ventes, stocks proches de la DLC, alertes prix et engagements clients. Export
                  mensuel automatique pour votre comptabilite.
                </p>
              </article>
              <article className="card">
                <h3>Smart Publishing</h3>
                <p className="muted">
                  Formulaire multi-etapes, compression d&apos;images, suggestions de titres et description auto-completes.
                </p>
              </article>
              <article className="card">
                <h3>Intelligence artificielle</h3>
                <p className="muted">
                  Scenarios de ventes selon la saison, recommandations de lot a mettre en avant, clustering client
                  (Decouverte, Fideles eco, Grands paniers, Locavores).
                </p>
              </article>
              <article className="card">
                <h3>Sobriete numerique</h3>
                <p className="muted">
                  Interface responsive, faible empreinte carbone, televersement et traitement en mode background pour
                  eviter les surcharges serveur.
                </p>
              </article>
            </div>
          </section>
        </main>
      )}
    </ShoppingShell>
  );
}
