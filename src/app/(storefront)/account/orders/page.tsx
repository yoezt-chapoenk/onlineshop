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
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>{t.account.orders}</h1>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        {orders.length === 0 ? (
          <div style={{ padding: 24, fontSize: 14, color: "var(--text-muted)" }}>
            {t.account.noOrdersYet}{" "}
            <Link href="/shop" style={{ color: "var(--gold)", textDecoration: "none" }}>
              {t.account.startShopping}
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg2)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              <tr>
                <th style={{ textAlign: "left", fontWeight: 500, padding: "16px 20px" }}>{t.account.orderNumber}</th>
                <th style={{ textAlign: "left", fontWeight: 500, padding: "16px 20px" }} className="hidden sm:table-cell">
                  {t.account.orderDate}
                </th>
                <th style={{ textAlign: "left", fontWeight: 500, padding: "16px 20px" }}>{t.account.orderStatus}</th>
                <th style={{ textAlign: "right", fontWeight: 500, padding: "16px 20px" }}>{t.account.orderTotal}</th>
                <th style={{ textAlign: "right", fontWeight: 500, padding: "16px 20px" }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{o.order_number}</td>
                  <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text)" }} className="hidden sm:table-cell">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 14, textAlign: "right", fontWeight: 600, color: "var(--text)" }}>
                    {formatRupiah(o.total)}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="link-gold"
                      style={{ fontSize: 12 }}
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
