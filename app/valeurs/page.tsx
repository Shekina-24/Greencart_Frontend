import type { Metadata } from "next";
import ValuesPage from "@/components/ValuesPage";

export const metadata: Metadata = {
  title: "Valeurs et sobriete | GreenCart",
  description:
    "Mission, vision et engagements de GreenCart : transparence, sobriete numerique et impact mesure pour les circuits courts.",
  alternates: {
    canonical: "/valeurs"
  }
};

export default function ValeursRoute() {
  return <ValuesPage />;
}

