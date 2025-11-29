import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CataloguePage from "@/components/CataloguePage";
import {
  getRegionOptions,
  resolveRegionParam
} from "@/lib/data/catalogue";

interface RegionPageProps {
  params: {
    region: string;
  };
}

export function generateStaticParams() {
  return getRegionOptions().map((option) => ({
    region: option.slug
  }));
}

export function generateMetadata({ params }: RegionPageProps): Metadata {
  const regionLabel = resolveRegionParam(params.region);
  if (!regionLabel) {
    return {
      title: "Region introuvable | GreenCart",
      description: "La region selectionnee n'est pas encore referencee."
    };
  }

  return {
    title: `Region ${regionLabel} | GreenCart`,
    description: `Lots locaux disponibles en ${regionLabel}. Favorisez le circuit court et reduisez votre impact carbone avec GreenCart.`,
    alternates: {
      canonical: `/regions/${params.region}`
    }
  };
}

export default function RegionPage({ params }: RegionPageProps) {
  const regionLabel = resolveRegionParam(params.region);

  if (!regionLabel) {
    notFound();
  }

  return (
    <CataloguePage
      title={`Production locale : ${regionLabel}`}
      description={`Catalogue des lots disponibles depuis la region ${regionLabel}. Les filtres restent accessibles pour ajuster votre recherche par categorie, DLC ou prix.`}
      initialFilters={{ region: regionLabel }}
    />
  );
}

