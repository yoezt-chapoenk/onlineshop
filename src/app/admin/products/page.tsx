import { getAdminClient } from "@/lib/supabase/admin";
import ProductsClient from "./ProductsClient";
import Pagination from "@/components/admin/Pagination";

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

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();
  const products: Row[] = [];
  let categories: { slug: string; name: string }[] = [];
  let configured = false;
  let total = 0;
  if (supabase) {
    configured = true;
    const [{ data: prodData, count }, { data: catData }] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, slug, sku, name, category_label, category_slug, retail_price, promotional_price, stock, is_featured",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("categories").select("slug, name").order("sort_order"),
    ]);
    products.push(...((prodData ?? []) as Row[]));
    categories = (catData ?? []) as { slug: string; name: string }[];
    total = count ?? 0;
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
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/admin/products"
      />
    </div>
  );
}
