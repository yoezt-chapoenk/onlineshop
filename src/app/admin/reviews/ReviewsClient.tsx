"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Check, X, Trash2 } from "lucide-react";

export interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  products: { name: string; slug: string } | null;
  users: { full_name: string | null; email: string } | null;
}

interface Props {
  rows: ReviewRow[];
  formatDate: (iso: string) => string;
}

const STATUS_STYLE: Record<ReviewRow["status"], { bg: string; color: string; label: string }> = {
  approved: { bg: "rgba(126,179,232,0.1)", color: "var(--gold)", label: "Approved" },
  pending: { bg: "rgba(201,169,110,0.15)", color: "var(--gold-light)", label: "Pending" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "var(--error)", label: "Rejected" },
};

export default function ReviewsClient({ rows, formatDate }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: ReviewRow["status"]) {
    setBusyId(id);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Hapus review ini secara permanen?")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
        No reviews in this state.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r) => {
        const badge = STATUS_STYLE[r.status];
        return (
          <article
            key={r.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 1, color: "var(--gold)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 14, height: 14, fill: i < r.rating ? "currentColor" : "none" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999, background: badge.bg, color: badge.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {badge.label}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(r.created_at)}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", marginTop: 12, lineHeight: 1.6 }}>
                {r.comment || <em style={{ color: "var(--text-dim)" }}>(no comment)</em>}
              </p>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                {r.users ? (r.users.full_name ?? r.users.email) : "Unknown user"} ·{" "}
                {r.products ? (
                  <Link href={`/shop/${r.products.slug}`} className="link-gold" target="_blank">
                    {r.products.name}
                  </Link>
                ) : (
                  <span style={{ color: "var(--text-dim)" }}>(deleted product)</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 130 }}>
              {r.status !== "approved" && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStatus(r.id, "approved")}
                  disabled={busyId === r.id}
                  style={{ fontSize: 12, padding: "8px 12px", gap: 6 }}
                >
                  <Check style={{ width: 14, height: 14 }} /> Approve
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStatus(r.id, "rejected")}
                  disabled={busyId === r.id}
                  style={{ fontSize: 12, padding: "8px 12px", gap: 6 }}
                >
                  <X style={{ width: 14, height: 14 }} /> Reject
                </button>
              )}
              <button
                type="button"
                className="admin-btn-delete"
                onClick={() => remove(r.id)}
                disabled={busyId === r.id}
                style={{ justifyContent: "center", gap: 6, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8 }}
              >
                <Trash2 style={{ width: 14, height: 14 }} /> Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
