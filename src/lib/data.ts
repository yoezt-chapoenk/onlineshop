import {
  products as seedProducts,
  categories as seedCategories,
} from "@/lib/products";
import { getPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  PriceTier,
  Product,
  ProductSummary,
  ProductVariant,
} from "@/lib/types";

/**
 * Server-side data access layer. Reads from Supabase when configured;
 * otherwise falls back to the static seed array so local dev keeps
 * working without database access.
 *
 * Every function is async so callers can swap from seed to live without
 * touching their call sites.
 */

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string;
  category_slug: Product["category"];
  category_label: string;
  gender: Product["gender"];
  style: Product["style"];
  frame: Product["frame"];
  retail_price: number;
  promotional_price: number | null;
  reseller_price: number | null;
  min_wholesale_qty: number;
  stock: number;
  weight_gram: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  colors: string[];
  frame_color: Product["frameColor"];
  lens_color: NonNullable<Product["lensColor"]> | null;
  specs: Product["specs"];
  image_urls: string[] | null;
  product_price_tiers?: PriceTierRow[];
  product_variants?: VariantRow[];
}

interface PriceTierRow {
  min_qty: number;
  max_qty: number | null;
  unit_price: number;
  label: string;
}

interface VariantRow {
  id: string;
  sku: string;
  color: string | null;
  variant_type: string | null;
  size: string | null;
  stock: number;
  price_override: number | null;
  image_url: string | null;
  sort_order: number;
}

interface CategoryRow {
  slug: Category["slug"];
  name: string;
  description: string;
  product_count?: number;
}

function rowToProduct(row: ProductRow): Product {
  const tiers: PriceTier[] = (row.product_price_tiers ?? [])
    .map((t) => ({
      minQty: t.min_qty,
      maxQty: t.max_qty,
      unitPrice: t.unit_price,
      label: t.label,
    }))
    .sort((a, b) => a.minQty - b.minQty);
  const variants: ProductVariant[] = (row.product_variants ?? [])
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color ?? undefined,
      type: v.variant_type ?? undefined,
      size: v.size ?? undefined,
      stock: v.stock,
      priceOverride: v.price_override ?? undefined,
      imageUrl: v.image_url ?? undefined,
      sortOrder: v.sort_order,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category_slug,
    categoryLabel: row.category_label,
    gender: row.gender,
    style: row.style,
    frame: row.frame,
    retailPrice: row.retail_price,
    promotionalPrice: row.promotional_price ?? undefined,
    resellerPrice: row.reseller_price ?? undefined,
    priceTiers: tiers,
    minWholesaleQty: row.min_wholesale_qty,
    stock: row.stock,
    weightGram: row.weight_gram,
    isFeatured: row.is_featured,
    isBestSeller: row.is_best_seller,
    isNewArrival: row.is_new_arrival,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    frameColor: row.frame_color,
    lensColor: row.lens_color ?? undefined,
    specs: row.specs ?? [],
    variants,
    imageUrls: row.image_urls ?? [],
  };
}

const PRODUCT_SELECT = `
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, frame_color, lens_color, specs, image_urls,
  product_price_tiers ( min_qty, max_qty, unit_price, label ),
  product_variants ( id, sku, color, variant_type, size, stock, price_override, image_url, sort_order )
`;

/**
 * Lighter column set for list views. Drops `description`, `short_description`,
 * `specs`, `gender`, `style`, and the full `product_variants` join — list
 * pages only need a `hasVariants` boolean, which we compute from a count.
 * `image_urls` is selected but the mapper keeps only the first entry.
 */
const PRODUCT_SUMMARY_SELECT = `
  id, slug, sku, name,
  category_slug, category_label, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, frame_color, lens_color, image_urls,
  product_price_tiers ( min_qty, max_qty, unit_price, label ),
  product_variants ( count )
`;

interface ProductSummaryRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_slug: Product["category"];
  category_label: string;
  frame: Product["frame"];
  retail_price: number;
  promotional_price: number | null;
  reseller_price: number | null;
  min_wholesale_qty: number;
  stock: number;
  weight_gram: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  frame_color: Product["frameColor"];
  lens_color: NonNullable<Product["lensColor"]> | null;
  image_urls: string[] | null;
  product_price_tiers?: PriceTierRow[];
  product_variants?: { count: number }[] | { count: number } | null;
}

function rowToSummary(row: ProductSummaryRow): ProductSummary {
  const tiers: PriceTier[] = (row.product_price_tiers ?? [])
    .map((t) => ({
      minQty: t.min_qty,
      maxQty: t.max_qty,
      unitPrice: t.unit_price,
      label: t.label,
    }))
    .sort((a, b) => a.minQty - b.minQty);

  // Supabase returns the count as either `[{count}]` or `{count}` depending
  // on whether the relation is many or one — normalize both shapes.
  const variantCount = Array.isArray(row.product_variants)
    ? row.product_variants[0]?.count ?? 0
    : row.product_variants?.count ?? 0;

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category_slug,
    categoryLabel: row.category_label,
    frame: row.frame,
    retailPrice: row.retail_price,
    promotionalPrice: row.promotional_price ?? undefined,
    resellerPrice: row.reseller_price ?? undefined,
    priceTiers: tiers,
    minWholesaleQty: row.min_wholesale_qty,
    stock: row.stock,
    weightGram: row.weight_gram,
    isFeatured: row.is_featured,
    isBestSeller: row.is_best_seller,
    isNewArrival: row.is_new_arrival,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    frameColor: row.frame_color,
    lensColor: row.lens_color ?? undefined,
    hasVariants: variantCount > 0,
    imageUrl: row.image_urls?.[0],
  };
}

function productToSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category,
    categoryLabel: p.categoryLabel,
    frame: p.frame,
    retailPrice: p.retailPrice,
    promotionalPrice: p.promotionalPrice,
    resellerPrice: p.resellerPrice,
    priceTiers: p.priceTiers,
    minWholesaleQty: p.minWholesaleQty,
    stock: p.stock,
    weightGram: p.weightGram,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    rating: p.rating,
    reviewCount: p.reviewCount,
    frameColor: p.frameColor,
    lensColor: p.lensColor,
    hasVariants: (p.variants?.length ?? 0) > 0,
    imageUrl: p.imageUrls?.[0],
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return seedProducts;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name", { ascending: true });
  if (error || !data) {
    console.warn("[data] getProducts fell back to seed:", error?.message);
    return seedProducts;
  }
  return (data as unknown as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicClient();
  if (!supabase) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.warn(
      `[data] getProductBySlug(${slug}) fell back to seed:`,
      error.message,
    );
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  if (!data) return null;
  return rowToProduct(data as unknown as ProductRow);
}

export async function getProductsByCategory(
  slug: Product["category"],
): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) {
    return seedProducts.filter((p) => p.category === slug);
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_slug", slug)
    .order("name", { ascending: true });
  if (error || !data) {
    return seedProducts.filter((p) => p.category === slug);
  }
  return (data as unknown as ProductRow[]).map(rowToProduct);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await getProductsByCategory(product.category);
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getPublicClient();
  if (!supabase) return seedCategories;
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) return seedCategories;

  // Compute product counts in a single grouped query.
  const { data: counts } = await supabase
    .from("products")
    .select("category_slug");
  const countMap = new Map<string, number>();
  for (const row of (counts ?? []) as { category_slug: string }[]) {
    countMap.set(row.category_slug, (countMap.get(row.category_slug) ?? 0) + 1);
  }

  return (data as CategoryRow[]).map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    productCount: countMap.get(c.slug) ?? 0,
  }));
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await getProducts();
  return products.map((p) => p.slug);
}

/**
 * List-view fetchers. Use these for storefront grids (home, shop, category,
 * related-products rail) so we don't ship `description`, `specs`, and the
 * full `variants` array down the RSC wire for every card on the page.
 */
export async function getProductSummaries(): Promise<ProductSummary[]> {
  const supabase = getPublicClient();
  if (!supabase) return seedProducts.map(productToSummary);
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .order("name", { ascending: true });
  if (error || !data) {
    console.warn(
      "[data] getProductSummaries fell back to seed:",
      error?.message,
    );
    return seedProducts.map(productToSummary);
  }
  return (data as unknown as ProductSummaryRow[]).map(rowToSummary);
}

/**
 * Featured products for the homepage rail. Pushes the filter down to the
 * database so we don't fetch the entire catalog just to slice 4 items.
 */
export async function getFeaturedSummaries(
  limit = 4,
): Promise<ProductSummary[]> {
  const supabase = getPublicClient();
  if (!supabase) {
    return seedProducts
      .filter((p) => p.isFeatured || p.isNewArrival)
      .slice(0, limit)
      .map(productToSummary);
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .or("is_featured.eq.true,is_new_arrival.eq.true")
    .order("is_new_arrival", { ascending: false })
    .order("name", { ascending: true })
    .limit(limit);
  if (error || !data) {
    return seedProducts
      .filter((p) => p.isFeatured || p.isNewArrival)
      .slice(0, limit)
      .map(productToSummary);
  }
  return (data as unknown as ProductSummaryRow[]).map(rowToSummary);
}

export async function getProductSummariesByCategory(
  slug: Product["category"],
): Promise<ProductSummary[]> {
  const supabase = getPublicClient();
  if (!supabase) {
    return seedProducts
      .filter((p) => p.category === slug)
      .map(productToSummary);
  }
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .eq("category_slug", slug)
    .order("name", { ascending: true });
  if (error || !data) {
    return seedProducts
      .filter((p) => p.category === slug)
      .map(productToSummary);
  }
  return (data as unknown as ProductSummaryRow[]).map(rowToSummary);
}

export async function getRelatedProductSummaries(
  product: Pick<Product, "id" | "category">,
  limit = 4,
): Promise<ProductSummary[]> {
  const all = await getProductSummariesByCategory(product.category);
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}
