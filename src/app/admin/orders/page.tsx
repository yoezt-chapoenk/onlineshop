import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  money,
  formatDateTime,
  STATUS_BADGE,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/admin/format";

export const dynamic = "force-dynamic";

import OrdersTableClient, { type OrderRow } from "./OrdersTableClient";

interface SearchParams {
  status?: string;
  q?: string;
}

async function loadOrders(searchParams: SearchParams): Promise<{
  configured: boolean;
  orders: OrderRow[];
}> {
  const supabase = getAdminClient();
  if (!supabase) return { configured: false, orders: [] };

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total, item_count, status, payment_method, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.status && ORDER_STATUSES.includes(searchParams.status as OrderStatus)) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.q) {
    const q = searchParams.q.trim();
    if (q) {
      // Strip PostgREST .or() filter delimiters AND the two ILIKE
      // wildcard chars (`%`, `_`) plus the escape char (`\`). Without
      // stripping `_` an admin search for "_" would match any single
      // character in every row; without stripping `\` an attacker
      // could alter the ILIKE escape semantics.
      const safe = q.replace(/[%_\\,()"]/g, "");
      if (safe) {
        query = query.or(
          `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%`,
        );
      }
    }
  }

  const { data } = await query;
  return { configured: true, orders: (data ?? []) as OrderRow[] };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { configured, orders } = await loadOrders(params);
  const activeStatus = params.status ?? "all";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Orders</h1>
          <p className="text-sm text-[color:var(--color-navy-400)]">
            {orders.length} order{orders.length === 1 ? "" : "s"} shown
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/orders/export/"
          className="btn btn-outline text-xs"
        >
          Export CSV
        </a>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured. Connect it to manage real orders.
        </div>
      )}

      <form
        method="GET"
        className="flex flex-wrap gap-2 items-center bg-white border border-[color:var(--color-cloud-200)] rounded-2xl p-3"
      >
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded-full border font-medium ${activeStatus === "all" ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]" : "border-[color:var(--color-cloud-200)] text-[color:var(--color-navy-700)] hover:bg-[color:var(--color-cloud-100)]"}`}
          >
            All
          </Link>
          {ORDER_STATUSES.map((s) => {
            const active = activeStatus === s;
            return (
              <Link
                key={s}
                href={`/admin/orders?status=${s}`}
                className={`px-3 py-1.5 rounded-full border font-medium capitalize ${active ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]" : "border-[color:var(--color-cloud-200)] text-[color:var(--color-navy-700)] hover:bg-[color:var(--color-cloud-100)]"}`}
              >
                {s}
              </Link>
            );
          })}
        </div>
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search by order #, name, or email"
          className="input ml-auto !py-2 text-sm w-full sm:w-72"
        />
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        <button type="submit" className="btn btn-primary text-xs">
          Search
        </button>
      </form>

      <OrdersTableClient orders={orders} />
    </div>
  );
}
