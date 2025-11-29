'use client';

import ShoppingShell from "./ShoppingShell";

const QUESTIONS = [
  {
    question: "Comment fonctionnent les livraisons ?",
    answer:
      "Les producteurs choisissent leur mode de livraison (point relais, retrait ferme, livraison verte). Les delais sont communiques dans le recapitulatif commande et mis a jour en temps reel."
  },
  {
    question: "Puis-je retourner un produit ?",
    answer:
      "Oui, sous 24h apres reception pour les lots frais et 7 jours pour l'epicerie. Les retours se font via le tableau de bord client avec photos et commentaire."
  },
  {
    question: "Le paiement est-il securise ?",
    answer:
      "GreenCart integre PayGreen/Stripe avec 3D Secure. Les informations de paiement ne transitent jamais par nos serveurs."
  },
  {
    question: "Comment devenir producteur partenaire ?",
    answer:
      "Creez un compte producteur, completez la verification KYC et planifiez un rendez-vous onboarding pour connecter votre catalogue."
  }
];

export default function HelpPage() {
  return (
    <ShoppingShell>
      {(experience) => (
        <main className="container page-transition" style={{ display: "grid", gap: "var(--space-12)" }}>
          <section className="section">
            <div>
              <div className="badge badge--impact">FAQ &amp; Assistance</div>
              <h1 style={{ marginTop: "var(--space-2)" }}>Aide GreenCart</h1>
            </div>
            <p className="muted">
              Retours, livraisons, securite paiement : retrouvez les reponses aux questions frequentes. Notre equipe
              support reste disponible du lundi au vendredi (9h-18h).
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <button className="btn btn--primary" type="button" onClick={() => experience.openAuthModal("login")}>
                Acceder a mon compte
              </button>
              <a className="btn btn--secondary" href="mailto:support@greencart.local">
                Contacter le support
              </a>
            </div>
          </section>

          <section className="section">
            <div className="grid cards-2">
              {QUESTIONS.map((item) => (
                <article className="card" key={item.question}>
                  <h3>{item.question}</h3>
                  <p className={item.question === QUESTIONS[0].question ? "" : "muted"}>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </ShoppingShell>
  );
}
