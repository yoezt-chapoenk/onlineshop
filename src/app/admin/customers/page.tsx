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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Customers</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">
          {rows.length} customer{rows.length === 1 ? "" : "s"}
        </p>
      </header>
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured.
        </div>
      )}
      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)] bg-[color:var(--color-cloud-100)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spent</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[color:var(--color-navy-400)]">No customers yet.</td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-t border-[color:var(--color-cloud-200)]">
                    <td className="px-4 py-3 font-medium">{c.full_name}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">{c.order_count}</td>
                    <td className="px-4 py-3 font-semibold">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.total_spent)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--color-navy-400)]">{formatDateTime(c.created_at)}</td>
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
