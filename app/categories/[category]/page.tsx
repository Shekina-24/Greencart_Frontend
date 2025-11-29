import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CataloguePage from "@/components/CataloguePage";
import {
  getCategoryOptions,
  resolveCategoryParam
} from "@/lib/data/catalogue";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export function generateStaticParams() {
  return getCategoryOptions().map((option) => ({
    category: option.slug
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const categoryLabel = resolveCategoryParam(params.category);
  if (!categoryLabel) {
    return {
      title: "Categorie introuvable | GreenCart",
      description: "La categorie recherchee n'est pas disponible."
    };
  }

  return {
    title: `Categorie ${categoryLabel} | GreenCart`,
    description: `Lots ${categoryLabel.toLowerCase()} disponibles en circuit court et issus de la lutte contre le gaspillage.`,
    alternates: {
      canonical: `/categories/${params.category}`
    }
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryLabel = resolveCategoryParam(params.category);

  if (!categoryLabel) {
    notFound();
  }

  return (
    <CataloguePage
      title={`Categorie ${categoryLabel}`}
      description={`Selection de produits ${categoryLabel.toLowerCase()} prets a etre delivres partout en France. Les lots affiches privilegient les circuits courts et la transparence des DLC.`}
      initialFilters={{ category: categoryLabel }}
    />
  );
}

