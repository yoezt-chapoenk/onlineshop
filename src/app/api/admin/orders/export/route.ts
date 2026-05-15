import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  // Defend against CSV formula injection (CWE-1236). When a customer
  // submits a name like '=CMD(...)' or '+EXEC(...)', spreadsheet apps
  // interpret the leading character as a formula on open. Prefix any
  // value that begins with =, +, -, @, tab, or CR with a single quote
  // so it's rendered as text instead of evaluated.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { data, error } = await ctx.supabase
    .from("orders")
    .select(
      "order_number, status, customer_name, customer_email, customer_phone, payment_method, item_count, weight_gram, subtotal, shipping_cost, total, shipping_courier, shipping_service, tracking_courier, tracking_number, shipping_city, shipping_province, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  const headers = [
    "order_number",
    "status",
    "customer_name",
    "customer_email",
    "customer_phone",
    "payment_method",
    "item_count",
    "weight_gram",
    "subtotal",
    "shipping_cost",
    "total",
    "shipping_courier",
    "shipping_service",
    "tracking_courier",
    "tracking_number",
    "shipping_city",
    "shipping_province",
    "created_at",
  ];
  const lines = [headers.join(",")];
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    lines.push(headers.map((h) => csvEscape(r[h])).join(","));
  }
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
