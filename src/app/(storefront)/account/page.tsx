import Link from "next/link";
import { ShoppingBag, UserPlus, ArrowRight } from "lucide-react";
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
  delivered: t.orderStatus.delivered,
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t.account.welcome(profile?.full_name ?? authUser?.email ?? "")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">{t.account.role}</p>
          <p className="mt-2 text-lg font-bold">{ROLE_LABEL[role] ?? role}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            {t.account.resellerStatus}
          </p>
          <p className="mt-2 text-lg font-bold">{RESELLER_STATUS_LABEL[status] ?? status}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            {t.nav.cart}
          </p>
          <Link href="/cart" className="mt-2 inline-flex items-center gap-1 text-lg font-bold text-[color:var(--color-navy-900)]">
            <ShoppingBag className="h-5 w-5" /> {t.common.checkout}
          </Link>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t.account.orders}</h2>
          <Link href="/account/orders" className="text-sm text-[color:var(--color-navy-900)] hover:underline">
            {t.common.showMore}
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="mt-4 text-sm text-[color:var(--color-muted)]">
            {t.account.noOrdersYet}{" "}
            <Link href="/shop" className="text-[color:var(--color-navy-900)] hover:underline">
              {t.account.startShopping}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
            {recentOrders.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{o.order_number}</p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatRupiah(o.total)}</p>
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="text-xs text-[color:var(--color-navy-900)] hover:underline inline-flex items-center gap-1"
                  >
                    {t.account.viewOrder} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {role !== "reseller" && status !== "approved" && (
        <section className="card p-6 bg-[color:var(--color-blue-50)] border-[color:var(--color-blue-100)]">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[color:var(--color-navy-900)] text-white flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{t.account.becomeReseller}</h3>
              <p className="mt-1 text-sm text-[color:var(--color-muted)]">{t.account.resellerExplain}</p>
              <Link href="/account/become-reseller" className="btn btn-primary mt-4 inline-flex">
                {t.account.submitResellerApplication}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
