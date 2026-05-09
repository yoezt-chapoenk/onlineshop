import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";

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

export default async function AdminCustomersPage() {
  const supabase = getAdminClient();
  let configured = false;
  let rows: CustomerRow[] = [];
  if (supabase) {
    configured = true;
    const [customers, orders] = await Promise.all([
      supabase
        .from("customers")
        .select("id, email, full_name, phone, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("customer_email, total, status"),
    ]);
    type OrderAgg = { customer_email: string; total: number; status: string };
    const stats = new Map<string, { count: number; total: number }>();
    for (const o of (orders.data ?? []) as OrderAgg[]) {
      const cur = stats.get(o.customer_email) ?? { count: 0, total: 0 };
      cur.count += 1;
      if (!["cancelled", "refunded"].includes(o.status)) cur.total += o.total;
      stats.set(o.customer_email, cur);
    }
    rows = ((customers.data ?? []) as Omit<CustomerRow, "order_count" | "total_spent">[]).map((c) => {
      const s = stats.get(c.email) ?? { count: 0, total: 0 };
      return { ...c, order_count: s.count, total_spent: s.total };
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Customers</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          {rows.length} customer{rows.length === 1 ? "" : "s"}
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
      </div>
    </div>
  );
}
