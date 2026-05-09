import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import ProductForm, { type ProductFormValues } from "../ProductForm";

export const dynamic = "force-dynamic";

const EMPTY: ProductFormValues = {
  slug: "",
  sku: "",
  name: "",
  short_description: "",
  description: "",
  category_slug: "",
  category_label: "",
  gender: "unisex",
  style: "casual",
  frame: "classic",
  retail_price: 0,
  promotional_price: null,
  reseller_price: null,
  min_wholesale_qty: 0,
  stock: 0,
  weight_gram: 0,
  is_featured: false,
  is_best_seller: false,
  is_new_arrival: false,
  rating: 0,
  review_count: 0,
  frame_color: "black",
  lens_color: null,
  specs: [],
  image_urls: [],
  price_tiers: [],
  variants: [],
};

export default async function NewProductPage() {
  const supabase = getAdminClient();
  let categories: { slug: string; name: string }[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("categories")
      .select("slug, name")
      .order("sort_order");
    categories = (data ?? []) as { slug: string; name: string }[];
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Link href="/admin/products" className="link-muted" style={{ fontSize: 12, fontWeight: 500 }}>
        ← All products
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>New product</h1>
      <ProductForm initial={EMPTY} categories={categories} mode="create" />
    </div>
  );
}
