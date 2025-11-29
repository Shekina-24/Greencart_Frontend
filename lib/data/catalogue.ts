import { PRODUCTS } from "@/data/products";
import type { Product } from "@/lib/types";
import { slugify } from "@/lib/slugify";

export interface SlugOption {
  slug: string;
  label: string;
}

const categoryOptions: SlugOption[] = Array.from(
  new Set(PRODUCTS.map((product) => product.category))
)
  .sort()
  .map((label) => ({
    label,
    slug: slugify(label)
  }));

const regionOptions: SlugOption[] = Array.from(
  new Set(PRODUCTS.map((product) => product.region))
)
  .sort()
  .map((label) => ({
    label,
    slug: slugify(label)
  }));

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getCategoryOptions(): SlugOption[] {
  return categoryOptions;
}

export function getCategorySlugs(): string[] {
  return categoryOptions.map((option) => option.slug);
}

export function getRegionOptions(): SlugOption[] {
  return regionOptions;
}

export function getRegionSlugs(): string[] {
  return regionOptions.map((option) => option.slug);
}

export function getProductSlugs(): string[] {
  return PRODUCTS.map((product) => product.slug);
}

export function resolveCategoryParam(param: string): string | undefined {
  return categoryOptions.find((option) => option.slug === param)?.label;
}

export function resolveRegionParam(param: string): string | undefined {
  return regionOptions.find((option) => option.slug === param)?.label;
}
