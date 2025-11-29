'use client';

import { useCallback, useMemo } from "react";
import LandingHero from "@/components/LandingHero";
import LandingImpact from "@/components/LandingImpact";
import LandingProducers from "@/components/LandingProducers";
import LandingSteps from "@/components/LandingSteps";
import CatalogueSection from "@/components/CatalogueSection";
import DashboardSection from "@/components/DashboardSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import ProducersSection from "@/components/ProducersSection";
import ShoppingShell from "@/components/ShoppingShell";
import ValuesSection from "@/components/ValuesSection";
import type { ShoppingExperience } from "@/hooks/useShoppingExperience";
import { LANDING_METRICS, type LandingMetric } from "@/data/landing";
import type { AnalyticsSummary } from "@/lib/types";

interface MarketingContentProps {
  experience: ShoppingExperience;
  metrics: LandingMetric[];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function describePeriod(periodEnd: string): string {
  try {
    const date = new Date(periodEnd);
    return `Donnees arretees au ${date.toLocaleDateString("fr-FR")}`;
  } catch {
    return "Donnees recentes GreenCart";
  }
}

function buildMetrics(summary: AnalyticsSummary | null | undefined): LandingMetric[] {
  if (!summary) {
    return LANDING_METRICS;
  }

  const periodDescription = describePeriod(summary.periodEnd);

  return [
    {
      id: 1,
      value: formatNumber(summary.totalOrders),
      label: "Commandes solidaires",
      description: `${periodDescription} - ${formatNumber(summary.totalItemsSold)} produits sauves`
    },
    {
      id: 2,
      value: formatCurrency(summary.totalRevenueCents),
      label: "Chiffre d'affaires local",
      description: "Revenu redistribue aux producteurs responsables"
    },
    {
      id: 3,
      value: formatCurrency(summary.averageOrderValueCents),
      label: "Panier moyen",
      description: "Achats responsables en circuit court"
    }
  ];
}

function MarketingContent({ experience, metrics }: MarketingContentProps) {
  const scrollToId = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <main className="page-transition">
      <section id="accueil">
        <LandingHero onOpenRegister={() => experience.openAuthModal("register")} />
      </section>

      <section id="mission" className="container">
        <ValuesSection />
      </section>

      <section id="etapes" aria-labelledby="etapes-title">
        <div className="container landing-page__content" style={{ paddingTop: "var(--space-12)" }}>
          <LandingSteps />
          <LandingProducers />
        </div>
      </section>

      <section id="impact" aria-labelledby="impact-title">
        <LandingImpact metrics={metrics} />
      </section>

      <section id="catalogue" className="container">
        <FeaturedProductsSection
          products={experience.featuredProducts}
          onAddToCart={experience.addToCart}
          onOpenDetails={experience.openProduct}
          onExploreCatalogue={() => scrollToId("catalogue-liste")}
        />
      </section>

      <section id="catalogue-liste" className="container">
        <CatalogueSection
          filters={experience.filters}
          categories={experience.categories}
          regions={experience.regions}
          products={experience.filteredProducts}
          totalProducts={experience.totalProducts}
          page={experience.page}
          pageSize={experience.pageSize}
          isLoading={experience.isLoadingProducts}
          onFiltersChange={experience.setFilters}
          onPageChange={experience.setPage}
          onAddToCart={experience.addToCart}
          onOpenDetails={experience.openProduct}
        />
      </section>

      <section id="producteurs" className="container">
        <ProducersSection onBecomeProducer={() => experience.openAuthModal("register")} />
      </section>

      <section id="tableau-de-bord" className="container">
        <DashboardSection metrics={experience.metrics} onSimulateWeek={experience.simulateWeek} />
      </section>
    </main>
  );
}

export interface MarketingHomeProps {
  analyticsSummary?: AnalyticsSummary | null;
}

export default function MarketingHome({ analyticsSummary = null }: MarketingHomeProps = {}) {
  const metrics = useMemo(() => buildMetrics(analyticsSummary), [analyticsSummary]);

  return (
    <ShoppingShell>
      {(experience) => <MarketingContent experience={experience} metrics={metrics} />}
    </ShoppingShell>
  );
}
