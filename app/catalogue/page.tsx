import type { Metadata } from "next";
import CataloguePage from "@/components/CataloguePage";

export const metadata: Metadata = {
  title: "Catalogue national | GreenCart",
  description:
    "Explorez le catalogue GreenCart : lots anti-gaspi, produits locaux et circuits courts disponibles sur l'ensemble du territoire.",
  alternates: {
    canonical: "/catalogue"
  }
};

export default function CatalogueRoute() {
  return (
    <CataloguePage
      title="Catalogue national GreenCart"
      description=""
    />
  );
}

