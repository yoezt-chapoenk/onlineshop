import Link from "next/link";
import { ShoppingBag, UserPlus, ArrowRight, LayoutDashboard } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { t } from "@/lib/i18n";

const ROLE_LABEL: Record<string, string> = {
  customer: t.account.customer,
  reseller: t.account.reseller,
  wholesale: t.account.wholesale,
  admin: t.account.admin,
};

const RESELLER_STATUS_LABEL: Record<string, string> = {
  none: t.account.statusNone,
  pending: t.account.statusPending,
  approved: t.account.statusApproved,
  rejected: t.account.statusRejected,
};

const ORDER_STATUS_LABEL: Record<string, string> = {
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

export default async function AccountOverviewPage() {
  const { authUser, profile } = await getCurrentUser();
  const admin = getAdminClient();
  let recentOrders: OrderRow[] = [];
  if (admin && authUser) {
    const { data } = await admin
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .eq("customer_email", authUser.email ?? "")
      .order("created_at", { ascending: false })
      .limit(3);
    recentOrders = (data ?? []) as OrderRow[];
  }

  const role = profile?.role ?? "customer";
  const status = profile?.reseller_status ?? "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>
        {t.account.welcome(profile?.full_name ?? authUser?.email ?? "")}
      </h1>

      {/* Admin Shortcut Banner */}
      {role === "admin" && (
        <section style={{ background: "var(--gold)", color: "var(--bg)", padding: 24, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LayoutDashboard style={{ width: 20, height: 20, color: "var(--bg)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Anda login sebagai Admin</p>
                <p style={{ color: "rgba(0,0,0,0.6)", fontSize: 12, marginTop: 4 }}>Kelola toko, produk, pesanan, dan konten dari Dashboard Admin.</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link href="/admin" className="btn" style={{ background: "var(--bg)", color: "var(--text)", fontSize: 12, fontWeight: 600, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <LayoutDashboard style={{ width: 14, height: 14 }} /> Dashboard Admin
              </Link>
              <Link href="/admin/orders" className="btn" style={{ background: "rgba(0,0,0,0.15)", color: "var(--bg)", fontSize: 12, fontWeight: 600, padding: "8px 16px", border: "none" }}>
                Pesanan
              </Link>
              <Link href="/admin/products" className="btn" style={{ background: "rgba(0,0,0,0.15)", color: "var(--bg)", fontSize: 12, fontWeight: 600, padding: "8px 16px", border: "none" }}>
                Produk
              </Link>
            </div>
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
        <div style={{ background: "var(--surface)", padding: 24, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>{t.account.role}</p>
          <p style={{ marginTop: 8, fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{ROLE_LABEL[role] ?? role}</p>
        </div>
        <div style={{ background: "var(--surface)", padding: 24, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
            {t.account.resellerStatus}
          </p>
          <p style={{ marginTop: 8, fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{RESELLER_STATUS_LABEL[status] ?? status}</p>
        </div>
        <div style={{ background: "var(--surface)", padding: 24, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
            {t.nav.cart}
          </p>
          <Link href="/cart" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 400, color: "var(--gold)", textDecoration: "none" }}>
            <ShoppingBag style={{ width: 18, height: 18 }} /> {t.common.checkout}
          </Link>
        </div>
      </div>

      <section style={{ background: "var(--surface)", padding: 24, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{t.account.orders}</h2>
          <Link href="/account/orders" className="link-muted" style={{ fontSize: 13 }}>
            {t.common.showMore}
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--text-muted)", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {t.account.noOrdersYet}{" "}
            <Link href="/shop" style={{ color: "var(--gold)", textDecoration: "none" }}>
              {t.account.startShopping}
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recentOrders.map((o) => (
              <li key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{o.order_number}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatRupiah(o.total)}</p>
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="link-muted"
                    style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}
                  >
                    {t.account.viewOrder} <ArrowRight style={{ width: 12, height: 12 }} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {role !== "reseller" && status !== "approved" && (
        <section style={{ background: "var(--bg2)", padding: 24, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 40, height: 40, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <UserPlus style={{ width: 20, height: 20, color: "var(--text)" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{t.account.becomeReseller}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{t.account.resellerExplain}</p>
              <Link href="/account/become-reseller" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>
                {t.account.submitResellerApplication}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
