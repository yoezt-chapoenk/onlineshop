import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

interface CustomerRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

const PAGE_SIZE = 25;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();
  let configured = false;
  let rows: CustomerRow[] = [];
  let total = 0;
  if (supabase) {
    configured = true;
    const { data: customers, count } = await supabase
      .from("customers")
      .select("id, email, full_name, phone, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    total = count ?? 0;

    // Aggregate stats by customer_id, falling back to email only when the
    // order row never resolved to a customer. Joining via email like before
    // produced wrong totals whenever a user updated their email or made
    // guest purchases with typos. We fetch only the orders that belong to
    // the customers shown on this page to keep memory bounded.
    const ids = (customers ?? []).map((c) => (c as { id: string }).id);
    type OrderAgg = {
      customer_id: string | null;
      customer_email: string;
      total: number;
      status: string;
    };
    let orderAggs: OrderAgg[] = [];
    if (ids.length > 0) {
      const emails = (customers ?? []).map((c) => (c as { email: string }).email);
      const { data: ord } = await supabase
        .from("orders")
        .select("customer_id, customer_email, total, status")
        .or(`customer_id.in.(${ids.join(",")}),customer_email.in.(${emails.map((e) => `"${e.replace(/"/g, "")}"`).join(",")})`);
      orderAggs = (ord ?? []) as OrderAgg[];
    }
    const statsById = new Map<string, { count: number; total: number }>();
    const statsByEmail = new Map<string, { count: number; total: number }>();
    for (const o of orderAggs) {
      const key = o.customer_id ?? `email:${o.customer_email}`;
      const bucket = o.customer_id ? statsById : statsByEmail;
      const mapKey = o.customer_id ?? o.customer_email;
      const cur = bucket.get(mapKey) ?? { count: 0, total: 0 };
      cur.count += 1;
      if (!["cancelled", "refunded"].includes(o.status)) cur.total += o.total;
      bucket.set(mapKey, cur);
      void key;
    }
    rows = ((customers ?? []) as Omit<CustomerRow, "order_count" | "total_spent">[]).map((c) => {
      const idStat = statsById.get(c.id);
      const emailStat = statsByEmail.get(c.email);
      const order_count = (idStat?.count ?? 0) + (emailStat?.count ?? 0);
      const total_spent = (idStat?.total ?? 0) + (emailStat?.total ?? 0);
      return { ...c, order_count, total_spent };
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Customers</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          {total.toLocaleString()} customer{total === 1 ? "" : "s"} · page {page}
        </p>
      </header>
      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}
      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>Phone</th>
                <th style={{ padding: "12px 16px" }}>Orders</th>
                <th style={{ padding: "12px 16px" }}>Total spent</th>
                <th style={{ padding: "12px 16px" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>No customers yet.</td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{c.full_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{c.email}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{c.phone ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{c.order_count}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--gold)" }}>
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.total_spent)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{formatDateTime(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          basePath="/admin/customers"
        />
      </div>
    </div>
  );
}
