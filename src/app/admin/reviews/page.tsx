import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";
import Pagination from "@/components/admin/Pagination";
import ReviewsClient, { type ReviewRow } from "./ReviewsClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

interface SearchParams {
  status?: "pending" | "approved" | "rejected" | "all";
  page?: string;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();
  let rows: ReviewRow[] = [];
  let total = 0;
  let configured = false;

  if (supabase) {
    configured = true;
    let q = supabase
      .from("product_reviews")
      .select(
        "id, product_id, rating, comment, status, created_at, products(name, slug), users(full_name, email)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status !== "all") q = q.eq("status", status);

    const { data, count } = await q;
    rows = (data ?? []) as unknown as ReviewRow[];
    total = count ?? 0;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Product reviews
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          {total.toLocaleString()} review{total === 1 ? "" : "s"} — approve, reject, or delete. Only approved reviews count toward the product&apos;s aggregate rating.
        </p>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["all", "approved", "pending", "rejected"] as const).map((s) => {
          const active = status === s;
          return (
            <a
              key={s}
              href={s === "all" ? "/admin/reviews" : `/admin/reviews?status=${s}`}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: active ? "var(--gold)" : "var(--border)",
                background: active ? "var(--gold)" : "transparent",
                color: active ? "var(--bg)" : "var(--text)",
                textDecoration: "none",
                fontSize: 12,
                textTransform: "capitalize",
              }}
            >
              {s}
            </a>
          );
        })}
      </div>

      <ReviewsClient rows={rows} formatDate={(s) => formatDateTime(s)} />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/admin/reviews"
        params={{ status: status === "all" ? undefined : status }}
      />
    </div>
  );
}
