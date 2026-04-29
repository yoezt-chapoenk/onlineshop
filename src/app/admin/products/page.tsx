import { getAdminClient } from "@/lib/supabase/admin";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_label: string;
  category_slug: string;
  retail_price: number;
  promotional_price: number | null;
  stock: number;
  is_featured: boolean;
}

export default async function AdminProductsPage() {
  const supabase = getAdminClient();
  const products: Row[] = [];
  let categories: { slug: string; name: string }[] = [];
  let configured = false;
  if (supabase) {
    configured = true;
    const [{ data: prodData }, { data: catData }] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, slug, sku, name, category_label, category_slug, retail_price, promotional_price, stock, is_featured",
        )
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("slug, name").order("sort_order"),
    ]);
    products.push(...((prodData ?? []) as Row[]));
    categories = (catData ?? []) as { slug: string; name: string }[];
  }

  return (
    <div className="space-y-4">
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured. Catalog is read from the static seed
          file; switch to Supabase to manage products from this dashboard.
        </div>
      )}
      <ProductsClient initialProducts={products} categories={categories} />
    </div>
  );
}
