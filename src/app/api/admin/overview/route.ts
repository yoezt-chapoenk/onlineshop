import { NextResponse } from "next/server";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const [orders, recent, items, low] = await Promise.all([
    ctx.supabase.from("orders").select("total, status"),
    ctx.supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    ctx.supabase.from("order_items").select("product_id, product_name, quantity"),
    ctx.supabase
      .from("products")
      .select("id, name, sku, stock")
      .lte("stock", 10)
      .order("stock", { ascending: true })
      .limit(10),
  ]);

  type Order = { total: number; status: string };
  const allOrders = (orders.data ?? []) as Order[];
  const totalSales = allOrders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  const pendingPayments = allOrders.filter((o) => o.status === "pending").length;
  const toProcess = allOrders.filter((o) =>
    ["paid", "processing", "packed"].includes(o.status),
  ).length;

  type Item = { product_id: string | null; product_name: string; quantity: number };
  const counts = new Map<string, { name: string; qty: number }>();
  for (const it of (items.data ?? []) as Item[]) {
    const key = it.product_id ?? `name:${it.product_name}`;
    const cur = counts.get(key) ?? { name: it.product_name, qty: 0 };
    cur.qty += it.quantity;
    counts.set(key, cur);
  }
  const bestSellers = [...counts.values()]
    .map(({ name, qty }) => ({ product_name: name, total_qty: qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  return NextResponse.json({
    totalSales,
    totalOrders: allOrders.length,
    pendingPayments,
    toProcess,
    lowStock: low.data ?? [],
    recent: recent.data ?? [],
    bestSellers,
  });
}
