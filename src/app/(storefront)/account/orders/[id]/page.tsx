import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { t } from "@/lib/i18n";
import RepeatOrderButton from "./RepeatOrderButton";
import ReviewForm from "@/components/products/ReviewForm";

const STATUS_LABEL: Record<string, string> = {
  pending: t.orderStatus.pending,
  paid: t.orderStatus.paid,
  processing: t.orderStatus.processing,
  packed: t.orderStatus.packed,
  shipped: t.orderStatus.shipped,
  fulfilled: t.orderStatus.delivered,
  cancelled: t.orderStatus.cancelled,
  refunded: t.orderStatus.refunded,
};

interface OrderItemRow {
  product_id: string;
  product_slug: string;
  product_sku: string;
  product_name: string;
  variant_id: string | null;
  variant_label: string | null;
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
  shipping_courier: string;
  shipping_service: string;
  shipping_cost: number;
  payment_method: string;
  subtotal: number;
  total: number;
  status: string;
  tracking_courier: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: OrderItemRow[];
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { authUser } = await getCurrentUser();
  const admin = getAdminClient();
  if (!admin || !authUser) notFound();
  const { data } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_email, customer_name, customer_phone, shipping_province, shipping_city, shipping_district, shipping_postal_code, shipping_address, shipping_courier, shipping_service, shipping_cost, payment_method, subtotal, total, status, tracking_courier, tracking_number, created_at, order_items(product_id, product_slug, product_sku, product_name, variant_id, variant_label, quantity, unit_price, tier_label, subtotal)",
    )
    .eq("id", id)
    .eq("customer_email", authUser.email ?? "")
    .maybeSingle<OrderDetail>();
  if (!data) notFound();

  const { data: reviews } = await admin
    .from("product_reviews")
    .select("product_id")
    .eq("order_id", id);
  const reviewedProductIds = new Set(reviews?.map((r) => r.product_id) || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>{data.order_number}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {new Date(data.created_at).toLocaleString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {STATUS_LABEL[data.status] ?? data.status}
          </p>
        </div>
        <RepeatOrderButton items={data.order_items} />
      </div>

      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{t.account.orders}</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", minWidth: 500 }}>
            <thead style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                <th style={{ textAlign: "left", fontWeight: 500, paddingBottom: 16 }}>Produk</th>
                <th style={{ textAlign: "center", fontWeight: 500, paddingBottom: 16 }}>Qty</th>
                <th style={{ textAlign: "right", fontWeight: 500, paddingBottom: 16 }}>Harga</th>
                <th style={{ textAlign: "right", fontWeight: 500, paddingBottom: 16 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.order_items.map((item, idx) => (
                <tr key={`${item.product_slug}-${idx}`} style={{ borderBottom: idx === data.order_items.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 0" }}>
                    <Link
                      href={`/shop/${item.product_slug}`}
                      style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text)"}
                    >
                      {item.product_name}
                    </Link>
                    {item.variant_label && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        {item.variant_label}
                      </p>
                    )}
                    {item.tier_label && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {item.tier_label}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "16px 0", textAlign: "center", fontSize: 14, color: "var(--text)" }}>{item.quantity}</td>
                  <td style={{ padding: "16px 0", textAlign: "right", fontSize: 14, color: "var(--text)" }}>{formatRupiah(item.unit_price)}</td>
                  <td style={{ padding: "16px 0", textAlign: "right", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.status === "fulfilled" && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Ulasan Produk</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, marginBottom: 16 }}>Pesanan ini telah selesai. Anda dapat memberikan ulasan untuk produk yang dibeli.</p>
            {data.order_items.map((item, idx) => {
              if (reviewedProductIds.has(item.product_id)) return null;
              return (
                <ReviewForm 
                  key={idx} 
                  productId={item.product_id} 
                  orderId={data.id} 
                  productName={item.product_name} 
                />
              );
            })}
          </div>
        )}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>Alamat Pengiriman</h2>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{data.customer_name}</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>{data.customer_phone}</p>
          <p style={{ fontSize: 14, color: "var(--text)", marginTop: 12, lineHeight: 1.5 }}>
            {data.shipping_address}
            <br />
            {data.shipping_district}, {data.shipping_city}
            <br />
            {data.shipping_province} {data.shipping_postal_code}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}>
            {data.shipping_courier} · {data.shipping_service}
          </p>
          {data.tracking_number && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>{t.account.trackingNumber}: </span>
                <span style={{ fontFamily: "monospace", color: "var(--text)" }}>{data.tracking_number}</span>
              </p>
              <a
                href={`https://biteship.com/id/track?waybill=${data.tracking_number}&courier=${data.tracking_courier || data.shipping_courier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 12, marginTop: 12 }}
              >
                Lacak Pengiriman
                <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          )}
        </section>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>{t.common.total}</h2>
          <dl style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--text-muted)" }}>{t.common.subtotal}</dt>
              <dd style={{ color: "var(--text)" }}>{formatRupiah(data.subtotal)}</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--text-muted)" }}>{t.common.shipping}</dt>
              <dd style={{ color: "var(--text)" }}>{formatRupiah(data.shipping_cost)}</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
              <dt style={{ fontWeight: 600, color: "var(--text)" }}>{t.common.total}</dt>
              <dd style={{ fontWeight: 600, color: "var(--gold)" }}>
                {formatRupiah(data.total)}
              </dd>
            </div>
          </dl>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
            Pembayaran: {data.payment_method.toUpperCase()}
          </p>
          {data.status === "pending" && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <Link href={`/account/payment-confirmation?order=${data.order_number}`} className="btn btn-primary" style={{ display: "block", textAlign: "center", width: "100%" }}>
                Konfirmasi Pembayaran
              </Link>
              <p style={{ fontSize: 12, color: "var(--text-dim)", textAlign: "center", marginTop: 12 }}>
                Sudah transfer? Silakan unggah bukti di sini.
              </p>
            </div>
          )}
        </section>
      </div>

      <div>
        <Link href="/account/orders" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
          ← {t.common.back}
        </Link>
      </div>
    </div>
  );
}
