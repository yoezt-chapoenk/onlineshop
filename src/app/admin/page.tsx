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
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-muted)", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      {hint ? (
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-dim)" }}>{hint}</div>
      ) : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { configured, stats, recent, bestSellers, lowStock } = await loadOverview();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
            Overview
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            Snapshot of sales, fulfillment queue, and stock health.
          </p>
        </div>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured in this environment. Set{" "}
          <code style={{ fontSize: 12, background: "var(--bg2)", padding: "2px 4px", borderRadius: 4 }}>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code style={{ fontSize: 12, background: "var(--bg2)", padding: "2px 4px", borderRadius: 4 }}>SUPABASE_SERVICE_ROLE_KEY</code> to populate
          this dashboard with real data.
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard label="Total sales" value={money(stats.totalSales)} hint="Excludes cancelled/refunded" />
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Pending payment" value={String(stats.pendingPayments)} />
        <StatCard label="To process" value={String(stats.toProcess)} hint="paid · processing · packed" />
        <StatCard label="Low stock" value={String(stats.lowStock)} hint="≤ 10 units" />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No orders yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "8px 12px 8px 0" }}>Order</th>
                    <th style={{ padding: "8px 12px" }}>Customer</th>
                    <th style={{ padding: "8px 12px" }}>Total</th>
                    <th style={{ padding: "8px 12px" }}>Status</th>
                    <th style={{ padding: "8px 0 8px 12px" }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const badge = STATUS_BADGE[o.status];
                    return (
                      <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px 10px 0", fontFamily: "monospace", fontSize: 12 }}>
                          <Link href={`/admin/orders/${o.id}`} style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
                            {o.order_number}
                          </Link>
                        </td>
                        <td style={{ padding: "10px 12px", color: "var(--text)" }}>{o.customer_name}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 500, color: "var(--text)" }}>{money(o.total)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: "var(--bg2)", color: "var(--text)" }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: "10px 0 10px 12px", fontSize: 12, color: "var(--text-muted)" }}>
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

        <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
            Best sellers
          </h2>
          {bestSellers.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No data yet.</p>
          ) : (
            <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {bestSellers.map((b, i) => (
                <li
                  key={b.product_name}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 14 }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ display: "inline-flex", height: 20, width: 20, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--bg2)", fontSize: 10, fontWeight: 700, color: "var(--text)" }}>
                      {i + 1}
                    </span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>{b.product_name}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {b.total_qty}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Low-stock products
          </h2>
          <Link
            href="/admin/products"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", textDecoration: "none" }}
          >
            Manage products →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>All products are healthy.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "8px 12px 8px 0" }}>Product</th>
                  <th style={{ padding: "8px 12px" }}>SKU</th>
                  <th style={{ padding: "8px 0 8px 12px" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <Link href={`/admin/products/${p.id}`} style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>{p.sku}</td>
                    <td style={{ padding: "10px 0 10px 12px", fontWeight: 600, color: p.stock <= 0 ? "var(--error)" : "var(--gold)" }}>{p.stock}</td>
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
