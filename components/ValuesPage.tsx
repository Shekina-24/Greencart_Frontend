'use client';

import ShoppingShell from "./ShoppingShell";

export default function ValuesPage() {
  return (
    <ShoppingShell>
      {() => (
        <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
          <section className="section">
            <div>
              <div className="badge badge--impact">Plateforme de marque</div>
              <h1 style={{ marginTop: "var(--space-2)" }}>Valeurs GreenCart</h1>
            </div>
            <p className="muted">
              Notre approche privilegie la transparence, la sobriete numerique et la preuve concrete de l&apos;impact. Chaque
              fonctionnalite du produit est concue pour faciliter le quotidien des producteurs partenaires et des
              foyers responsables.
            </p>
          </section>

          <section className="section" id="marque">
            <div className="grid cards-3">
              <article className="card">
                <h3>Mission</h3>
                <p className="muted">
                  Rendre accessibles les produits responsables en circuit court, tout en valorisant les invendus et en
                  mesurant l&apos;impact carbone.
                </p>
              </article>
              <article className="card">
                <h3>Vision</h3>
                <p className="muted">
                  Le local rime avec modernite : outiller les producteurs avec l&apos;IA pour rivaliser avec l&apos;agro-industrie
                  et securiser leur revenu.
                </p>
              </article>
              <article className="card">
                <h3>Promesse</h3>
                <p className="muted">
                  Mieux manger, mieux remunerer, moins gaspiller. Un discours factuel, illustre par des indicateurs
                  verifiables.
                </p>
              </article>
            </div>
          </section>

          <section className="section">
            <h2>Sobriete numerique</h2>
            <div className="grid cards-2">
              <article className="card">
                <h3>Budgets techniques</h3>
                <p className="muted">
                  JS executable &lt; 300 KB, CSS &lt; 100 KB, images LCP &lt; 120 KB en mobile. Code-splitting Next.js,
                  optimisation AVIF/WebP et chargements lazy garantissent la tenue des budgets.
                </p>
              </article>
              <article className="card">
                <h3>Performances suivi</h3>
                <p className="muted">
                  Core Web Vitals monitores via GA4 + Metabase. Lighthouse CI dans la pipeline, audit ecoindex en run
                  mensuel pour limiter l&apos;empreinte numerique.
                </p>
              </article>
              <article className="card">
                <h3>Accessibilite</h3>
                <p className="muted">
                  Contraste 4.5:1 minimum, navigation clavier totale, tests axe-core et ARIA exhaustifs. Les messages et
                  erreurs sont annonces via aria-live.
                </p>
              </article>
              <article className="card">
                <h3>Protection des donnees</h3>
                <p className="muted">
                  Consent Mode, respect Do-Not-Track, CSP stricte et minimisation des trackers. Les formulaires
                  integrent honeypot et temporisation anti-bots.
                </p>
              </article>
            </div>
          </section>

          <section className="section">
            <h2>Tonalite et transparence</h2>
            <div className="card">
              <p className="muted">
                GreenCart privilegie un ton pedagogue et concret. Chaque fiche produit affiche la DLC, la provenance, le
                volume economise et l&apos;impact CO2e. Les dashboards consomateurs et producteurs affichent des metriques
                actionnables (CO2 evite, euros economises, lots a pousser).
              </p>
            </div>
          </section>
        </main>
      )}
    </ShoppingShell>
  );
}
