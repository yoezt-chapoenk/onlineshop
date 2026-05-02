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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.order_number}</h1>
          <p className="text-sm text-[color:var(--color-muted)]">
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

      <section className="card p-6">
        <h2 className="text-base font-semibold">{t.account.orders}</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            <tr>
              <th className="text-left font-medium py-2">Produk</th>
              <th className="text-center font-medium py-2">Qty</th>
              <th className="text-right font-medium py-2">Harga</th>
              <th className="text-right font-medium py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-line)]">
            {data.order_items.map((item, idx) => (
              <tr key={`${item.product_slug}-${idx}`}>
                <td className="py-2">
                  <Link
                    href={`/shop/${item.product_slug}`}
                    className="font-semibold hover:text-[color:var(--color-navy-900)] hover:underline transition-colors"
                  >
                    {item.product_name}
                  </Link>
                  {item.variant_label && (
                    <p className="text-xs text-[color:var(--color-navy-900)]">
                      {item.variant_label}
                    </p>
                  )}
                  <p className="text-xs text-[color:var(--color-muted)]">SKU {item.product_sku}</p>
                  {item.tier_label && (
                    <p className="text-xs text-[color:var(--color-navy-900)] mt-0.5">
                      {item.tier_label}
                    </p>
                  )}
                </td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatRupiah(item.unit_price)}</td>
                <td className="py-2 text-right font-bold">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.status === "fulfilled" && (
          <div className="mt-8 space-y-4 border-t border-[color:var(--color-line)] pt-6">
            <h3 className="text-sm font-bold">Ulasan Produk</h3>
            <p className="text-xs text-[color:var(--color-muted)]">Pesanan ini telah selesai. Anda dapat memberikan ulasan untuk produk yang dibeli.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="card p-6 text-sm">
          <h2 className="text-base font-semibold mb-3">Alamat Pengiriman</h2>
          <p className="font-semibold">{data.customer_name}</p>
          <p className="text-[color:var(--color-muted)]">{data.customer_phone}</p>
          <p className="mt-2">
            {data.shipping_address}
            <br />
            {data.shipping_district}, {data.shipping_city}
            <br />
            {data.shipping_province} {data.shipping_postal_code}
          </p>
          <p className="mt-3 text-[color:var(--color-muted)]">
            {data.shipping_courier} · {data.shipping_service}
          </p>
          {data.tracking_number && (
            <div className="mt-3">
              <p>
                <span className="text-[color:var(--color-muted)]">{t.account.trackingNumber}: </span>
                <span className="font-mono">{data.tracking_number}</span>
              </p>
              <a
                href={`https://biteship.com/id/track?waybill=${data.tracking_number}&courier=${data.tracking_courier || data.shipping_courier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline !px-3 !py-1.5 text-xs mt-2 inline-flex items-center gap-1.5"
              >
                Lacak Pengiriman
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </section>
        <section className="card p-6 text-sm">
          <h2 className="text-base font-semibold mb-3">{t.common.total}</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">{t.common.subtotal}</dt>
              <dd>{formatRupiah(data.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-muted)]">{t.common.shipping}</dt>
              <dd>{formatRupiah(data.shipping_cost)}</dd>
            </div>
            <div className="flex justify-between border-t border-[color:var(--color-line)] pt-2">
              <dt className="font-semibold">{t.common.total}</dt>
              <dd className="font-bold text-[color:var(--color-navy-900)]">
                {formatRupiah(data.total)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[color:var(--color-muted)]">
            Pembayaran: {data.payment_method.toUpperCase()}
          </p>
          {data.status === "pending" && (
            <div className="mt-4 pt-4 border-t border-[color:var(--color-line)]">
              <Link href={`/account/payment-confirmation?order=${data.order_number}`} className="btn btn-primary w-full shadow-md hover:-translate-y-0.5 transition-transform">
                Konfirmasi Pembayaran
              </Link>
              <p className="text-xs text-center text-[color:var(--color-muted)] mt-2">
                Sudah transfer? Silakan unggah bukti di sini.
              </p>
            </div>
          )}
        </section>
      </div>

      <Link href="/account/orders" className="text-sm text-[color:var(--color-navy-900)] hover:underline">
        ← {t.common.back}
      </Link>
    </div>
  );
}
