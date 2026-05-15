import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";
import Pagination from "@/components/admin/Pagination";
import UsersClient, { type UserRow } from "./UsersClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

interface SearchParams {
  page?: string;
  role?: "customer" | "reseller" | "wholesale" | "admin";
  q?: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();
  let configured = false;
  let rows: UserRow[] = [];
  let total = 0;

  if (supabase) {
    configured = true;
    let q = supabase
      .from("users")
      .select(
        "id, email, full_name, phone, role, reseller_status, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (params.role) q = q.eq("role", params.role);
    if (params.q) {
      const safe = params.q.replace(/[%_\\,()"]/g, "");
      if (safe) {
        q = q.or(`email.ilike.%${safe}%,full_name.ilike.%${safe}%`);
      }
    }
    const { data, count } = await q;
    rows = ((data ?? []) as UserRow[]).map((u) => ({
      ...u,
      created_at_human: formatDateTime(u.created_at),
    }));
    total = count ?? 0;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Users & roles
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Manage who has admin, reseller, or wholesale access. {total.toLocaleString()} total user{total === 1 ? "" : "s"}.
        </p>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}

      <form method="GET" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 12 }}>
        <select
          name="role"
          defaultValue={params.role ?? ""}
          style={{ padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 13 }}
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="reseller">Reseller</option>
          <option value="wholesale">Wholesale</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search email or name…"
          style={{ flex: 1, maxWidth: 280, padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, fontSize: 14 }}
        />
        <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
          Filter
        </button>
      </form>

      <UsersClient rows={rows} />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/admin/users"
        params={{ role: params.role, q: params.q }}
      />
    </div>
  );
}
