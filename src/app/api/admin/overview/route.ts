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
    ctx.supabase.from("order_items").select("product_name, quantity"),
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

  type Item = { product_name: string; quantity: number };
  const counts = new Map<string, number>();
  for (const it of (items.data ?? []) as Item[]) {
    counts.set(it.product_name, (counts.get(it.product_name) ?? 0) + it.quantity);
  }
  const bestSellers = [...counts.entries()]
    .map(([product_name, total_qty]) => ({ product_name, total_qty }))
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
