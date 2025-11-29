interface HeroSectionProps {
  totalCo2: number;
  totalSavings: number;
  producers: number;
  onShowCatalogue: () => void;
  onShowValues: () => void;
}

export default function HeroSection({
  totalCo2,
  totalSavings,
  producers,
  onShowCatalogue,
  onShowValues
}: HeroSectionProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="badge">Mission - Vision - Impact</div>
        <h1 id="hero-title">
          Rendre accessibles les produits responsables en circuit court, tout en valorisant chaque invendu.
        </h1>
        <p>
          GreenCart outille les producteurs avec l&apos;IA pour piloter stocks et ventes, et permet aux foyers de
          mesurer chaque kilo de CO2e evite. Ton factuel, zero culpabilisation : place aux preuves.
        </p>
        <div className="cta" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <button className="btn btn--primary" type="button" onClick={onShowCatalogue}>
            Explorer le catalogue
          </button>
          <button className="btn btn--secondary" type="button" onClick={onShowValues}>
            Voir la plateforme de marque
          </button>
        </div>

        <div className="hero-kpis" aria-label="Chiffres clefs GreenCart">
          <div className="kpi-card">
            <strong>{totalCo2.toFixed(1)} kg</strong>
            <span>CO2e evites grace aux achats anti-gaspi</span>
          </div>
          <div className="kpi-card">
            <strong>{totalSavings.toFixed(0)} EUR</strong>
            <span>Economies cumulees cote foyers</span>
          </div>
          <div className="kpi-card">
            <strong>{producers}</strong>
            <span>Producteurs accompagnes par l&apos;IA GreenCart</span>
          </div>
        </div>
      </div>
    </section>
  );
}

