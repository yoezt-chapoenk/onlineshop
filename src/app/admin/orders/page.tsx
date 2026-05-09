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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Orders</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            {orders.length} order{orders.length === 1 ? "" : "s"} shown
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/orders/export/"
          className="btn btn-outline"
          style={{ fontSize: 12, padding: "6px 12px" }}
        >
          Export CSV
        </a>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured. Connect it to manage real orders.
        </div>
      )}

      <form
        method="GET"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 12 }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Link
            href="/admin/orders"
            style={{ 
              padding: "6px 12px", borderRadius: 999, border: "1px solid", fontWeight: 500, textDecoration: "none",
              ...(activeStatus === "all" 
                ? { background: "var(--gold)", color: "var(--bg)", borderColor: "var(--gold)" } 
                : { background: "transparent", color: "var(--text)", borderColor: "var(--border)" })
            }}
          >
            All
          </Link>
          {ORDER_STATUSES.map((s) => {
            const active = activeStatus === s;
            return (
              <Link
                key={s}
                href={`/admin/orders?status=${s}`}
                style={{ 
                  padding: "6px 12px", borderRadius: 999, border: "1px solid", fontWeight: 500, textTransform: "capitalize", textDecoration: "none",
                  ...(active 
                    ? { background: "var(--gold)", color: "var(--bg)", borderColor: "var(--gold)" } 
                    : { background: "transparent", color: "var(--text)", borderColor: "var(--border)" })
                }}
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
          style={{ width: "100%", maxWidth: 280, marginLeft: "auto", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 }}
        />
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
          Search
        </button>
      </form>

      <OrdersTableClient orders={orders} />
    </div>
  );
}
