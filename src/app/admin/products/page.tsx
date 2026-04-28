import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { money } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_label: string;
  retail_price: number;
  promotional_price: number | null;
  stock: number;
  is_featured: boolean;
}

export default async function AdminProductsPage() {
  const supabase = getAdminClient();
  const products: Row[] = [];
  let configured = false;
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("products")
      .select(
        "id, slug, sku, name, category_label, retail_price, promotional_price, stock, is_featured",
      )
      .order("created_at", { ascending: false });
    products.push(...((data ?? []) as Row[]));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Products</h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">
            {products.length} products in catalog
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary text-xs">
          + New product
        </Link>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured. Catalog is read from the static seed
          file; switch to Supabase to manage products from this dashboard.
        </div>
      )}

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)] bg-[color:var(--color-cloud-100)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Retail</th>
                <th className="px-4 py-3">Promo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Featured</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[color:var(--color-navy-400)]">
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t border-[color:var(--color-cloud-200)] hover:bg-[color:var(--color-cloud-50)]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="text-[color:var(--color-blue-600)] hover:underline font-medium">
                        {p.name}
                      </Link>
                      <div className="text-xs text-[color:var(--color-navy-400)]">/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">{p.category_label}</td>
                    <td className="px-4 py-3">{money(p.retail_price)}</td>
                    <td className="px-4 py-3">{p.promotional_price ? money(p.promotional_price) : <span className="text-[color:var(--color-navy-400)]">—</span>}</td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.is_featured ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-blue-100)] text-[color:var(--color-navy-900)]">
                          Featured
                        </span>
                      ) : <span className="text-[color:var(--color-navy-400)]">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
