import Providers from "@/components/Providers";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteDescription =
  "GreenCart connecte consommateurs et producteurs pour valoriser les invendus, reduire le gaspillage alimentaire et suivre l'impact carbone des achats.";

export const metadata: Metadata = {
  title: {
    default: "GreenCart | Anti-gaspi, local & bas carbone",
    template: "%s | GreenCart"
  },
  description: siteDescription,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "GreenCart | Anti-gaspi, local & bas carbone",
    description: siteDescription,
    type: "website",
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenCart | Anti-gaspi, local & bas carbone",
    description: siteDescription
  }
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
