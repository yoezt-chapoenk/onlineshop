import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  product_id: string | null;
  variant_id: string | null;
  delta: number;
  reason: string;
  order_id: string | null;
  note: string | null;
  actor: string | null;
  created_at: string;
  product?: { name: string; sku: string } | null;
}

const PAGE_SIZE = 50;

const REASON_LABEL: Record<string, string> = {
  order_create: "Order created",
  order_refund: "Refund / restock",
  admin_edit: "Admin edit",
  import: "Bulk import",
};

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; product?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getAdminClient();
  let configured = false;
  let rows: Row[] = [];
  let total = 0;

  if (supabase) {
    configured = true;
    let q = supabase
      .from("stock_movements")
      .select(
        "id, product_id, variant_id, delta, reason, order_id, note, actor, created_at, product:products(name, sku)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (params.product) q = q.eq("product_id", params.product);

    const { data, count } = await q;
    rows = (data ?? []) as unknown as Row[];
    total = count ?? 0;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Stock movements
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Append-only ledger of every stock change — order decrements, refund restocks, manual edits.
        </p>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden", borderRadius: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                <th style={{ padding: "10px 16px" }}>When</th>
                <th style={{ padding: "10px 16px" }}>Product</th>
                <th style={{ padding: "10px 16px" }}>Δ</th>
                <th style={{ padding: "10px 16px" }}>Reason</th>
                <th style={{ padding: "10px 16px" }}>Order</th>
                <th style={{ padding: "10px 16px" }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                    No stock movements yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-muted)" }}>{formatDateTime(r.created_at)}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text)" }}>
                      {r.product ? (
                        <>
                          {r.product_id ? (
                            <Link href={`/admin/products/${r.product_id}`} className="link-gold">
                              {r.product.name}
                            </Link>
                          ) : (
                            r.product.name
                          )}
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{r.product.sku}</div>
                        </>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>(deleted)</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 600, color: r.delta < 0 ? "var(--error)" : "var(--gold)" }}>
                      {r.delta > 0 ? "+" : ""}{r.delta}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text)" }}>
                      {REASON_LABEL[r.reason] ?? r.reason}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11 }}>
                      {r.order_id ? (
                        <Link href={`/admin/orders/${r.order_id}`} className="link-gold">view</Link>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      {r.note ?? r.actor ?? "—"}
                    </td>
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
          basePath="/admin/stock"
          params={{ product: params.product }}
        />
      </div>
    </div>
  );
}
