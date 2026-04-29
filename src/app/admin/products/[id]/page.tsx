import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import ProductForm, { type ProductFormValues } from "../ProductForm";

export const dynamic = "force-dynamic";

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string;
  category_slug: string;
  category_label: string;
  gender: string;
  style: string;
  frame: string;
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
  frame_color: string;
  lens_color: string | null;
  specs: { label: string; value: string }[];
  product_price_tiers: { min_qty: number; max_qty: number | null; unit_price: number; label: string }[];
  product_variants: {
    id: string;
    sku: string;
    color: string | null;
    variant_type: string | null;
    size: string | null;
    stock: number;
    price_override: number | null;
    sort_order: number;
  }[];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-6 text-sm">
        Supabase isn&apos;t configured.
      </div>
    );
  }
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, product_price_tiers(min_qty, max_qty, unit_price, label), product_variants(id, sku, color, variant_type, size, stock, price_override, sort_order)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("slug, name").order("sort_order"),
  ]);
  if (!product) notFound();
  const p = product as unknown as ProductRow;
  const initial: ProductFormValues = {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    short_description: p.short_description,
    description: p.description,
    category_slug: p.category_slug,
    category_label: p.category_label,
    gender: p.gender,
    style: p.style,
    frame: p.frame,
    retail_price: p.retail_price,
    promotional_price: p.promotional_price,
    reseller_price: p.reseller_price,
    min_wholesale_qty: p.min_wholesale_qty,
    stock: p.stock,
    weight_gram: p.weight_gram,
    is_featured: p.is_featured,
    is_best_seller: p.is_best_seller,
    is_new_arrival: p.is_new_arrival,
    rating: p.rating,
    review_count: p.review_count,
    colors: p.colors ?? [],
    frame_color: p.frame_color,
    lens_color: p.lens_color,
    specs: p.specs ?? [],
    price_tiers: (p.product_price_tiers ?? []).sort((a, b) => a.min_qty - b.min_qty),
    variants: (p.product_variants ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        variant_type: v.variant_type,
        size: v.size,
        stock: v.stock,
        price_override: v.price_override,
        sort_order: v.sort_order,
      })),
  };
  return (
    <div className="space-y-4">
      <Link href="/admin/products" className="text-xs text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)]">
        ← All products
      </Link>
      <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">{p.name}</h1>
      <ProductForm initial={initial} categories={(categories ?? []) as { slug: string; name: string }[]} mode="edit" />
    </div>
  );
}
