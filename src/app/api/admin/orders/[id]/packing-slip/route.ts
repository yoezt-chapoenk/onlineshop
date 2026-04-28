import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const fmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const { data, error } = await ctx.supabase
    .from("orders")
    .select(
      "order_number, customer_name, customer_phone, shipping_address, shipping_district, shipping_city, shipping_province, shipping_postal_code, shipping_courier, shipping_service, weight_gram, total, order_items(product_name, product_sku, quantity)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }
  type Item = { product_name: string; product_sku: string; quantity: number };
  const o = data as unknown as {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    shipping_district: string;
    shipping_city: string;
    shipping_province: string;
    shipping_postal_code: string;
    shipping_courier: string;
    shipping_service: string;
    weight_gram: number;
    total: number;
    order_items: Item[];
  };

  const items = o.order_items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.product_name)}</td><td style="font-family:monospace">${escapeHtml(i.product_sku)}</td><td style="text-align:right">${i.quantity}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Packing slip ${escapeHtml(o.order_number)}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #01083C; }
  h1 { margin: 0 0 4px; font-size: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border-bottom: 1px solid #d6dde4; padding: 8px; text-align: left; font-size: 13px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; font-size: 13px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: #495489; }
  @media print { .no-print { display: none; } }
</style></head>
<body>
  <h1>Juragan Grosir — Packing Slip</h1>
  <div class="label">Order</div>
  <div style="font-family:monospace">${escapeHtml(o.order_number)}</div>
  <div class="meta">
    <div>
      <div class="label">Ship to</div>
      <div><strong>${escapeHtml(o.customer_name)}</strong></div>
      <div>${escapeHtml(o.shipping_address)}</div>
      <div>${escapeHtml(o.shipping_district)}, ${escapeHtml(o.shipping_city)}</div>
      <div>${escapeHtml(o.shipping_province)} ${escapeHtml(o.shipping_postal_code)}</div>
      <div>${escapeHtml(o.customer_phone)}</div>
    </div>
    <div>
      <div class="label">Courier</div>
      <div>${escapeHtml(o.shipping_courier)} — ${escapeHtml(o.shipping_service)}</div>
      <div class="label" style="margin-top:8px">Weight</div>
      <div>${o.weight_gram} g</div>
      <div class="label" style="margin-top:8px">Total</div>
      <div>${fmt.format(o.total)}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>SKU</th><th style="text-align:right">Qty</th></tr></thead>
    <tbody>${items}</tbody>
  </table>
  <div class="no-print" style="margin-top:24px"><button onclick="window.print()">Print</button></div>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
