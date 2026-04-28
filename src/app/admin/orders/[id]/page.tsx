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
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)]"
          >
            ← All orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-[color:var(--color-navy-900)]">
            <span className="font-mono text-base">{order.order_number}</span>
          </h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">
            Created {formatDateTime(order.created_at)}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
            <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em] mb-3">
              Items
            </h2>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)]">
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 pr-2">SKU</th>
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2 pr-2">Unit price</th>
                    <th className="py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((it) => (
                    <tr key={it.id} className="border-t border-[color:var(--color-cloud-200)]">
                      <td className="py-2.5 pr-2">
                        <div>{it.product_name}</div>
                        {it.tier_label ? (
                          <div className="text-xs text-[color:var(--color-blue-600)]">
                            {it.tier_label}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-xs">{it.product_sku}</td>
                      <td className="py-2.5 pr-2">{it.quantity}</td>
                      <td className="py-2.5 pr-2">{money(it.unit_price)}</td>
                      <td className="py-2.5 font-medium">{money(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-sm">
                  <tr className="border-t border-[color:var(--color-cloud-200)]">
                    <td colSpan={4} className="py-2 pr-2 text-right text-[color:var(--color-navy-400)]">Subtotal</td>
                    <td className="py-2">{money(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2 pr-2 text-right text-[color:var(--color-navy-400)]">
                      Shipping ({order.shipping_courier} {order.shipping_service})
                    </td>
                    <td className="py-2">{money(order.shipping_cost)}</td>
                  </tr>
                  <tr className="border-t border-[color:var(--color-cloud-200)]">
                    <td colSpan={4} className="py-2 pr-2 text-right font-bold text-[color:var(--color-navy-900)]">Total</td>
                    <td className="py-2 font-bold text-[color:var(--color-navy-900)]">{money(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
            <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em] mb-3">
              Shipping address
            </h2>
            <div className="text-sm space-y-1">
              <div className="font-medium">{order.customer_name}</div>
              <div>{order.shipping_address}</div>
              <div>
                {order.shipping_district}, {order.shipping_city},{" "}
                {order.shipping_province} {order.shipping_postal_code}
              </div>
              <div className="text-[color:var(--color-navy-400)]">
                {order.customer_phone} · {order.customer_email}
              </div>
              {order.shipping_notes ? (
                <div className="pt-2 text-[color:var(--color-navy-400)]">
                  <span className="font-medium text-[color:var(--color-navy-900)]">Notes: </span>
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
      </section>
    </div>
  );
}
