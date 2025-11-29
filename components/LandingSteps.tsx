import { LANDING_STEPS } from "@/data/landing";
import type { LucideIcon } from "lucide-react";
import { Circle, ShoppingCart, Store, Truck } from "lucide-react";

const STEP_ICONS: Record<string, LucideIcon> = {
  Store,
  ShoppingCart,
  Truck
};

function StepIcon({ name }: { name: string }) {
  const IconComponent = STEP_ICONS[name] ?? Circle;
  return <IconComponent size={28} strokeWidth={1.5} aria-hidden />;
}

export default function LandingSteps() {
  return (
    <section className="landing-section">
      <div className="landing-section__header">
        <h2>Un parcours simple du champ &agrave; l&apos;assiette</h2>
        <p>
          GreenCart met en relation foyers et producteurs responsables. Composez un panier local en trois etapes
          claires, sans intermediaires inutiles.
        </p>
      </div>
      <div className="landing-steps">
        {LANDING_STEPS.map((step) => (
          <article key={step.id} className="landing-card">
            <div className="landing-card__icon">
              <StepIcon name={step.icon} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
