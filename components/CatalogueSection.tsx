import type { CatalogueFilters, Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface CatalogueSectionProps {
  filters: CatalogueFilters;
  categories: string[];
  regions: string[];
  products: Product[];
  totalProducts: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onFiltersChange: (filters: CatalogueFilters) => void;
  onPageChange: (page: number) => void;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

const SORT_OPTIONS: Array<{ value: CatalogueFilters["sort"]; label: string }> = [
  { value: "newest", label: "Nouveautes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
  { value: "dlc_asc", label: "DLC la plus proche" }
];

const RESET_FILTERS: CatalogueFilters = {
  category: "",
  region: "",
  availability: "",
  query: "",
  priceMin: null,
  priceMax: null,
  dlcMaxDays: null,
  sort: "newest"
};

export default function CatalogueSection({
  filters,
  categories,
  regions,
  products,
  totalProducts,
  page,
  pageSize,
  isLoading,
  onFiltersChange,
  onPageChange,
  onAddToCart,
  onOpenDetails
}: CatalogueSectionProps) {
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const updateFilter = (key: keyof CatalogueFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateNumericFilter = (key: "priceMin" | "priceMax" | "dlcMaxDays", value: string) => {
    const parsed = value === "" ? null : Number(value);
    onFiltersChange({ ...filters, [key]: Number.isFinite(parsed) ? parsed : null });
  };

  const resetFilters = () => {
    onFiltersChange({ ...RESET_FILTERS });
    onPageChange(1);
  };

  const goToPrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const goToNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <section id="catalogue" className="section">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h2>Catalogue national</h2>
          <p className="muted">
            Filtrez par categorie, region, prix ou DLC pour composer un panier responsable.
          </p>
        </div>

        <div className="filters" aria-label="Filtres catalogue" style={{ rowGap: "var(--space-2)" }}>
          <select
            className="select"
            aria-label="Categorie"
            value={filters.category}
            onChange={(event) => updateFilter("category", event.target.value)}
          >
            <option value="">Categorie - toutes</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="select"
            aria-label="Region"
            value={filters.region}
            onChange={(event) => updateFilter("region", event.target.value)}
          >
            <option value="">Region - toutes</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            className="select"
            aria-label="Disponibilite"
            value={filters.availability}
            onChange={(event) => updateFilter("availability", event.target.value)}
          >
            <option value="">Disponibilite</option>
            <option value="surplus">Surplus</option>
            <option value="normal">Standard</option>
          </select>

          <input
            className="input"
            placeholder="Rechercher... (ex: pommes)"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
          />

          <input
            className="input"
            type="number"
            min={0}
            placeholder="Prix min (EUR)"
            value={filters.priceMin ?? ""}
            onChange={(event) => updateNumericFilter("priceMin", event.target.value)}
          />

          <input
            className="input"
            type="number"
            min={0}
            placeholder="Prix max (EUR)"
            value={filters.priceMax ?? ""}
            onChange={(event) => updateNumericFilter("priceMax", event.target.value)}
          />

          <input
            className="input"
            type="number"
            min={0}
            placeholder="DLC max (jours)"
            value={filters.dlcMaxDays ?? ""}
            onChange={(event) => updateNumericFilter("dlcMaxDays", event.target.value)}
          />

          <select
            className="select"
            aria-label="Tri"
            value={filters.sort}
            onChange={(event) => updateFilter("sort", event.target.value as CatalogueFilters["sort"])}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn btn--ghost" type="button" onClick={resetFilters}>
            Reinitialiser
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-2)"
          }}
        >
          <span className="muted">
            {isLoading
              ? "Chargement en cours..."
              : `${totalProducts} produit${totalProducts > 1 ? "s" : ""}`}
          </span>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={goToPrevious}
              disabled={page <= 1 || isLoading}
            >
              Prec.
            </button>
            <span className="muted">
              Page {page} / {totalPages}
            </span>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={goToNext}
              disabled={page >= totalPages || isLoading}
            >
              Suiv.
            </button>
          </div>
        </div>
      </div>

      <div className="grid cards-3" aria-live="polite">
        {products.length === 0 ? (
          <p className="muted" style={{ gridColumn: "1 / -1" }}>
            {isLoading
              ? "Chargement des produits..."
              : "Aucun produit ne correspond aux filtres selectionnes."}
          </p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetails={onOpenDetails}
            />
          ))
        )}
      </div>
    </section>
  );
}
