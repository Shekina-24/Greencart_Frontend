import type { Metadata } from "next";
import ProducersPage from "@/components/ProducersPage";

export const metadata: Metadata = {
  title: "Espace producteur | GreenCart",
  description:
    "Publiez vos lots, pilotez vos stocks et beneficiez de recommandations IA pour anticiper la demande locale avec GreenCart.",
  alternates: {
    canonical: "/producteurs"
  }
};

export default function ProducteursRoute() {
  return <ProducersPage />;
}

