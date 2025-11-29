import type { Metadata } from "next";
import HelpPage from "@/components/HelpPage";

export const metadata: Metadata = {
  title: "Aide et FAQ | GreenCart",
  description:
    "Questions frequentes sur les livraisons, retours, paiements securises et accompagnement producteur.",
  alternates: {
    canonical: "/aide"
  }
};

export default function AideRoute() {
  return <HelpPage />;
}

