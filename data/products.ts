import type { Product } from "@/lib/types";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "pommes-moches-5-kg",
    name: "Pommes moches (5 kg)",
    price: 6.5,
    region: "Ile-de-France",
    category: "Fruits",
    availability: "surplus",
    co2Saved: 2.1,
    dlcDays: 6,
    unit: "Colis 5 kg",
    image:
      "https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=1200&auto=format&fit=crop",
    description:
      "Pommes hors calibre issues d'une recolte locale. Ideales pour compotes, jus et patisseries anti-gaspi."
  },
  {
    id: 2,
    slug: "legumes-varies-b-4-kg",
    name: "Legumes varies B (4 kg)",
    price: 7.9,
    region: "Hauts-de-France",
    category: "Legumes",
    availability: "surplus",
    co2Saved: 2.9,
    dlcDays: 4,
    unit: "Panier 4 kg",
    image:
      "https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?q=80&w=1200&auto=format&fit=crop",
    description:
      "Panier de legumes biscornus recoltes le matin meme. Varietes adapteees aux soupes et poelees familiales."
  },
  {
    id: 3,
    slug: "yaourts-fermiers-x12",
    name: "Yaourts fermiers (x12)",
    price: 5.5,
    region: "Bretagne",
    category: "Cremerie",
    availability: "normal",
    co2Saved: 0.6,
    dlcDays: 3,
    unit: "Lot x12",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop",
    description:
      "Yaourts nature au lait entier, texture genereuse. Date courte mais qualite garantie par la ferme."
  },
  {
    id: 4,
    slug: "pains-de-la-veille-x4",
    name: "Pains de la veille (x4)",
    price: 2,
    region: "Ile-de-France",
    category: "Boulangerie",
    availability: "surplus",
    co2Saved: 1.2,
    dlcDays: 1,
    unit: "Lot x4",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200&auto=format&fit=crop",
    description:
      "Pains tradition de la veille, croustillants apres quelques minutes au four. Emballage compostable."
  },
  {
    id: 5,
    slug: "tomates-irregulieres-3-kg",
    name: "Tomates irregulieres (3 kg)",
    price: 4.9,
    region: "Provence-Alpes-Cote d'Azur",
    category: "Legumes",
    availability: "surplus",
    co2Saved: 2.3,
    dlcDays: 5,
    unit: "Cagette 3 kg",
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1200&auto=format&fit=crop",
    description:
      "Tomates anciennes aux formes originales. Saveur ensoleillee, parfaites en salade ou en sauce."
  },
  {
    id: 6,
    slug: "fromage-de-chevre-demi-sec",
    name: "Fromage de chevre demi-sec",
    price: 3.9,
    region: "Auvergne-Rhone-Alpes",
    category: "Cremerie",
    availability: "normal",
    co2Saved: 0.4,
    dlcDays: 10,
    unit: "Unite 250 g",
    image:
      "https://images.unsplash.com/photo-1505575972945-2804b5c35f33?q=80&w=1200&auto=format&fit=crop",
    description:
      "Fromage de chevre demi-sec affine 10 jours. Gout franc, lait issu d'un elevage extensif."
  }
];
