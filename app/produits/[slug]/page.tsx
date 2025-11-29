import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { fetchProductBySlug, fetchProducts } from "@/lib/services/products";
import { fetchProductReviews } from "@/lib/services/reviews";
import type { Review } from "@/lib/types";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const { items } = await fetchProducts({ limit: 50 });
    return items.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) {
    return {
      title: "Produit introuvable | GreenCart",
      description: "Le lot recherche n'existe plus ou a ete retire du catalogue."
    };
  }

  const description =
    product.description ??
    `Lot ${product.category} disponible en ${product.region}. Impact carbone evite : ${
      product.co2Saved.toFixed(1)
    } kg CO2e.`;

  return {
    title: `${product.name} | GreenCart`,
    description,
    alternates: {
      canonical: `/produits/${product.slug}`
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `/produits/${product.slug}`,
      images: product.images && product.images.length > 0
        ? product.images.map((image) => ({ url: image.url, alt: product.name }))
        : [
            {
              url: product.image,
              alt: product.name
            }
          ]
    }
  };
}

export default async function ProductDetailRoute({ params }: ProductPageProps) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  let reviews = {
    items: [],
    total: 0
  } as { items: Review[]; total: number };
  try {
    const response = await fetchProductReviews(product.id, { limit: 50 });
    reviews = { items: response.items, total: response.total };
  } catch (error) {
    console.error("[ProductDetailRoute] Unable to load reviews", error);
  }

  return <ProductPage product={product} reviews={reviews.items} reviewsTotal={reviews.total} />;
}
