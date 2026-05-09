import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { money, formatDateTime, STATUS_BADGE, type OrderStatus } from "@/lib/admin/format";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

interface OrderItem {
  id: number;
  product_slug: string;
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tier_label: string | null;
  subtotal: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  shipping_address: string;
  shipping_notes: string | null;
  shipping_courier: string;
  shipping_service: string;
  shipping_cost: number;
  payment_method: string;
  subtotal: number;
  total: number;
  item_count: number;
  weight_gram: number;
  status: OrderStatus;
  tracking_courier: string | null;
  tracking_number: string | null;
  admin_note: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-6 text-sm">
        Supabase isn&apos;t configured.
      </div>
    );
  }
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, customer_email, customer_name, customer_phone,
       shipping_province, shipping_city, shipping_district, shipping_postal_code,
       shipping_address, shipping_notes, shipping_courier, shipping_service,
       shipping_cost, payment_method, subtotal, total, item_count, weight_gram,
       status, tracking_courier, tracking_number, admin_note, created_at,
       order_items(id, product_slug, product_sku, product_name, quantity, unit_price, tier_label, subtotal)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const order = data as unknown as OrderDetail;
  const badge = STATUS_BADGE[order.status];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Link
            href="/admin/orders"
            style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}
            className="hover:text-[var(--text)]"
          >
            ← All orders
          </Link>
          <h1 style={{ marginTop: 4, fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
            <span style={{ fontFamily: "monospace", fontSize: 16 }}>{order.order_number}</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Created {formatDateTime(order.created_at)}
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--bg2)", color: "var(--text)" }}>
          {badge.label}
        </span>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="lg:grid-cols-[2fr_1fr]">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
                Items
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "8px 12px 8px 0" }}>Product</th>
                      <th style={{ padding: "8px 12px" }}>SKU</th>
                      <th style={{ padding: "8px 12px" }}>Qty</th>
                      <th style={{ padding: "8px 12px" }}>Unit price</th>
                      <th style={{ padding: "8px 0 8px 12px" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px 10px 0" }}>
                          <div style={{ color: "var(--text)", fontWeight: 500 }}>{it.product_name}</div>
                          {it.tier_label ? (
                            <div style={{ fontSize: 12, color: "var(--gold)" }}>
                              {it.tier_label}
                            </div>
                          ) : null}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>{it.product_sku}</td>
                        <td style={{ padding: "10px 12px", color: "var(--text)" }}>{it.quantity}</td>
                        <td style={{ padding: "10px 12px", color: "var(--text)" }}>{money(it.unit_price)}</td>
                        <td style={{ padding: "10px 0 10px 12px", fontWeight: 600, color: "var(--text)" }}>{money(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ fontSize: 14 }}>
                    <tr style={{ borderTop: "1px solid var(--border)" }}>
                      <td colSpan={4} style={{ padding: "10px 12px 10px 0", textAlign: "right", color: "var(--text-muted)" }}>Subtotal</td>
                      <td style={{ padding: "10px 0 10px 12px", color: "var(--text)" }}>{money(order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ padding: "4px 12px 4px 0", textAlign: "right", color: "var(--text-muted)" }}>
                        Shipping ({order.shipping_courier} {order.shipping_service})
                      </td>
                      <td style={{ padding: "4px 0 4px 12px", color: "var(--text)" }}>{money(order.shipping_cost)}</td>
                    </tr>
                    <tr style={{ borderTop: "1px solid var(--border)" }}>
                      <td colSpan={4} style={{ padding: "10px 12px 10px 0", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Total</td>
                      <td style={{ padding: "10px 0 10px 12px", fontWeight: 700, color: "var(--text)" }}>{money(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>
                Shipping address
              </h2>
              <div style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{order.customer_name}</div>
                <div style={{ color: "var(--text)" }}>{order.shipping_address}</div>
                <div style={{ color: "var(--text)" }}>
                  {order.shipping_district}, {order.shipping_city},{" "}
                  {order.shipping_province} {order.shipping_postal_code}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
                  {order.customer_phone} · {order.customer_email}
                </div>
                {order.shipping_notes ? (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border)", color: "var(--text-muted)" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>Notes: </span>
                    {order.shipping_notes}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <OrderActions
            orderId={order.id}
            status={order.status}
            tracking_courier={order.tracking_courier ?? ""}
            tracking_number={order.tracking_number ?? ""}
            admin_note={order.admin_note ?? ""}
            payment_method={order.payment_method}
            weight_gram={order.weight_gram}
          />
        </div>
      </section>
    </div>
  );
}
