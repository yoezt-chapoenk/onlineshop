import Link from "next/link";

interface Props {
  /** Current page (1-indexed). */
  page: number;
  /** Page size (rows per page). */
  pageSize: number;
  /** Total row count returned by the query (Supabase exact count). */
  total: number;
  /** Path to render in the links — e.g. "/admin/orders". */
  basePath: string;
  /** Other search params to preserve across page navigation. */
  params?: Record<string, string | undefined>;
}

/**
 * Compact server-rendered pagination control. Uses plain Links so it
 * benefits from RSC navigation and doesn't ship JS. Hides itself when
 * total fits on a single page.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  function href(p: number): string {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v) qs.set(k, v);
    }
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
      }}
      aria-label="Pagination"
    >
      <div>
        Page <strong style={{ color: "var(--text)" }}>{page}</strong> of{" "}
        <strong style={{ color: "var(--text)" }}>{pages}</strong>
        <span style={{ marginLeft: 8 }}>· {total.toLocaleString()} total</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href={href(prev)}
          aria-disabled={page === 1}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            color: page === 1 ? "var(--text-dim)" : "var(--text)",
            textDecoration: "none",
            pointerEvents: page === 1 ? "none" : "auto",
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          ← Prev
        </Link>
        <Link
          href={href(next)}
          aria-disabled={page === pages}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            color: page === pages ? "var(--text-dim)" : "var(--text)",
            textDecoration: "none",
            pointerEvents: page === pages ? "none" : "auto",
            opacity: page === pages ? 0.5 : 1,
          }}
        >
          Next →
        </Link>
      </div>
    </nav>
  );
}
