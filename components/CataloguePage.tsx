'use client';

import type { ReactNode } from "react";
import type { CatalogueFilters } from "@/lib/types";
import type { ShoppingExperience } from "@/hooks/useShoppingExperience";
import CatalogueSection from "./CatalogueSection";
import ShoppingShell from "./ShoppingShell";

interface CataloguePageProps {
  title: string;
  description: string;
  initialFilters?: Partial<CatalogueFilters>;
  heroAside?: ReactNode;
}

function CataloguePageContent({
  experience,
  title,
  description,
  heroAside
}: CataloguePageProps & { experience: ShoppingExperience }) {
  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
     

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
    </main>
  );
}

export default function CataloguePage(props: CataloguePageProps) {
  return (
    <ShoppingShell initialFilters={props.initialFilters}>
      {(experience) => <CataloguePageContent {...props} experience={experience} />}
    </ShoppingShell>
  );
}
