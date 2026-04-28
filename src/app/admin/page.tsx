import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { money, formatDateTime, STATUS_BADGE, type OrderStatus } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

interface Stats {
  totalSales: number;
  totalOrders: number;
  pendingPayments: number;
  toProcess: number;
  lowStock: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

interface BestSeller {
  product_name: string;
  total_qty: number;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

async function loadOverview(): Promise<{
  configured: boolean;
  stats: Stats;
  recent: RecentOrder[];
  bestSellers: BestSeller[];
  lowStock: LowStockItem[];
}> {
  const supabase = getAdminClient();
  if (!supabase) {
    return {
      configured: false,
      stats: { totalSales: 0, totalOrders: 0, pendingPayments: 0, toProcess: 0, lowStock: 0 },
      recent: [],
      bestSellers: [],
      lowStock: [],
    };
  }

  const [orders, recent, items, low] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("order_items").select("product_name, quantity"),
    supabase
      .from("products")
      .select("id, name, sku, stock")
      .lte("stock", 10)
      .order("stock", { ascending: true })
      .limit(8),
  ]);

  const allOrders = (orders.data ?? []) as { total: number; status: OrderStatus }[];
  const totalSales = allOrders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const pendingPayments = allOrders.filter((o) => o.status === "pending").length;
  const toProcess = allOrders.filter((o) =>
    ["paid", "processing", "packed"].includes(o.status),
  ).length;

  const counts = new Map<string, number>();
  for (const it of (items.data ?? []) as { product_name: string; quantity: number }[]) {
    counts.set(it.product_name, (counts.get(it.product_name) ?? 0) + it.quantity);
  }
  const bestSellers = [...counts.entries()]
    .map(([product_name, total_qty]) => ({ product_name, total_qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  const lowStock = (low.data ?? []) as LowStockItem[];

  return {
    configured: true,
    stats: {
      totalSales,
      totalOrders: allOrders.length,
      pendingPayments,
      toProcess,
      lowStock: lowStock.length,
    },
    recent: (recent.data ?? []) as RecentOrder[],
    bestSellers,
    lowStock,
  };
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-navy-500)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--color-navy-900)]">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-[color:var(--color-navy-400)]">{hint}</div>
      ) : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { configured, stats, recent, bestSellers, lowStock } = await loadOverview();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">
            Overview
          </h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">
            Snapshot of sales, fulfillment queue, and stock health.
          </p>
        </div>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm text-[color:var(--color-navy-900)]">
          Supabase isn&apos;t configured in this environment. Set{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to populate
          this dashboard with real data.
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total sales" value={money(stats.totalSales)} hint="Excludes cancelled/refunded" />
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Pending payment" value={String(stats.pendingPayments)} />
        <StatCard label="To process" value={String(stats.toProcess)} hint="paid · processing · packed" />
        <StatCard label="Low stock" value={String(stats.lowStock)} hint="≤ 10 units" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[color:var(--color-blue-600)] hover:underline"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-[color:var(--color-navy-400)]">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)]">
                    <th className="py-2 pr-2">Order</th>
                    <th className="py-2 pr-2">Customer</th>
                    <th className="py-2 pr-2">Total</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const badge = STATUS_BADGE[o.status];
                    return (
                      <tr key={o.id} className="border-t border-[color:var(--color-cloud-200)]">
                        <td className="py-2.5 pr-2 font-mono text-xs">
                          <Link href={`/admin/orders/${o.id}`} className="text-[color:var(--color-blue-600)] hover:underline">
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-2">{o.customer_name}</td>
                        <td className="py-2.5 pr-2 font-medium">{money(o.total)}</td>
                        <td className="py-2.5 pr-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs text-[color:var(--color-navy-400)]">
                          {formatDateTime(o.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
          <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em] mb-3">
            Best sellers
          </h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-[color:var(--color-navy-400)]">No data yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {bestSellers.map((b, i) => (
                <li
                  key={b.product_name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-blue-100)] text-[10px] font-bold text-[color:var(--color-navy-900)]">
                      {i + 1}
                    </span>
                    <span className="truncate">{b.product_name}</span>
                  </span>
                  <span className="font-semibold text-[color:var(--color-navy-900)]">
                    {b.total_qty}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">
            Low-stock products
          </h2>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-[color:var(--color-blue-600)] hover:underline"
          >
            Manage products →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-[color:var(--color-navy-400)]">All products are healthy.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)]">
                  <th className="py-2 pr-2">Product</th>
                  <th className="py-2 pr-2">SKU</th>
                  <th className="py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-t border-[color:var(--color-cloud-200)]">
                    <td className="py-2.5 pr-2">
                      <Link href={`/admin/products/${p.id}`} className="text-[color:var(--color-blue-600)] hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-xs">{p.sku}</td>
                    <td className="py-2.5 font-semibold">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
