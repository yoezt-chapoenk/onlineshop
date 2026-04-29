import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { t } from "@/lib/i18n";

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

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export const metadata = { title: t.account.orders };

export default async function AccountOrdersPage() {
  const { authUser } = await getCurrentUser();
  const admin = getAdminClient();
  let orders: OrderRow[] = [];
  if (admin && authUser) {
    const { data } = await admin
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .eq("customer_email", authUser.email ?? "")
      .order("created_at", { ascending: false });
    orders = (data ?? []) as OrderRow[];
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t.account.orders}</h1>
      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-sm text-[color:var(--color-muted)]">
            {t.account.noOrdersYet}{" "}
            <Link href="/shop" className="text-[color:var(--color-navy-900)] hover:underline">
              {t.account.startShopping}
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[color:var(--color-cloud-100)] text-[color:var(--color-muted)] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium py-3 px-5">{t.account.orderNumber}</th>
                <th className="text-left font-medium py-3 px-5 hidden sm:table-cell">
                  {t.account.orderDate}
                </th>
                <th className="text-left font-medium py-3 px-5">{t.account.orderStatus}</th>
                <th className="text-right font-medium py-3 px-5">{t.account.orderTotal}</th>
                <th className="text-right font-medium py-3 px-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-line)]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 px-5 text-sm font-semibold">{o.order_number}</td>
                  <td className="py-3 px-5 text-sm hidden sm:table-cell">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-5 text-sm">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </td>
                  <td className="py-3 px-5 text-sm text-right font-bold">
                    {formatRupiah(o.total)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="text-xs text-[color:var(--color-navy-900)] hover:underline"
                    >
                      {t.account.viewOrder}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
