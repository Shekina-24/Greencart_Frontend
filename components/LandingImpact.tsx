import type { LandingMetric } from "@/data/landing";

interface LandingImpactProps {
  metrics: LandingMetric[];
}

export default function LandingImpact({ metrics }: LandingImpactProps) {
  return (
    <section className="landing-impact" aria-label="Indicateurs d impact GreenCart">
      <div className="container landing-impact__grid">
        {metrics.map((metric) => (
          <article key={metric.id} className="landing-impact__item">
            <strong>{metric.value}</strong>
            <span className="landing-impact__label">{metric.label}</span>
            <p>{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
