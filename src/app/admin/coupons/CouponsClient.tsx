"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_subtotal: number;
  max_uses: number | null;
  uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

function discountLabel(c: Pick<CouponRow, "discount_type" | "discount_value">) {
  return c.discount_type === "percent"
    ? `${c.discount_value}% off`
    : `${formatRupiah(c.discount_value)} off`;
}

export default function CouponsClient({ initial }: { initial: CouponRow[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponRow[]>(initial);
  const [draftOpen, setDraftOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [minSubtotal, setMinSubtotal] = useState(0);
  const [maxUses, setMaxUses] = useState<string>("");
  const [validUntil, setValidUntil] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discount_type: type,
        discount_value: value,
        min_subtotal: minSubtotal,
        max_uses: maxUses ? Number(maxUses) : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        is_active: true,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error ?? "Failed to create coupon");
      return;
    }
    const j = (await res.json()) as { coupon: CouponRow };
    setCoupons((cur) => [j.coupon, ...cur]);
    setDraftOpen(false);
    setCode("");
    setDescription("");
    setValue(10);
    setMinSubtotal(0);
    setMaxUses("");
    setValidUntil("");
    router.refresh();
  }

  async function toggle(c: CouponRow) {
    setBusy(true);
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    setBusy(false);
    if (res.ok) {
      setCoupons((cur) =>
        cur.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)),
      );
    }
  }

  async function remove(c: CouponRow) {
    if (!confirm(`Hapus kupon ${c.code}? Tidak bisa di-undo.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setCoupons((cur) => cur.filter((x) => x.id !== c.id));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setDraftOpen((v) => !v)}
          style={{ fontSize: 12, padding: "8px 16px", gap: 6 }}
        >
          <Plus style={{ width: 14, height: 14 }} /> {draftOpen ? "Close" : "New coupon"}
        </button>
      </div>

      {draftOpen && (
        <form
          onSubmit={create}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <label>
            <span className="label">Code</span>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className="input"
            />
          </label>
          <label>
            <span className="label">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Diskon musim panas"
              className="input"
            />
          </label>
          <label>
            <span className="label">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
              className="input"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (Rp)</option>
            </select>
          </label>
          <label>
            <span className="label">Value {type === "percent" ? "(%)" : "(Rp)"}</span>
            <input
              required
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="input"
            />
          </label>
          <label>
            <span className="label">Min subtotal (Rp)</span>
            <input
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(Number(e.target.value))}
              className="input"
            />
          </label>
          <label>
            <span className="label">Max uses (blank = ∞)</span>
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="input"
            />
          </label>
          <label>
            <span className="label">Valid until</span>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="input"
            />
          </label>
          {error && (
            <div style={{ gridColumn: "1 / -1", color: "var(--error)", fontSize: 13 }}>
              {error}
            </div>
          )}
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Create coupon"}
            </button>
          </div>
        </form>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                <th style={{ padding: "10px 16px" }}>Code</th>
                <th style={{ padding: "10px 16px" }}>Discount</th>
                <th style={{ padding: "10px 16px" }}>Min subtotal</th>
                <th style={{ padding: "10px 16px" }}>Uses</th>
                <th style={{ padding: "10px 16px" }}>Valid until</th>
                <th style={{ padding: "10px 16px" }}>Status</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    No coupons yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--gold)" }}>
                      {c.code}
                      {c.description && (
                        <div style={{ fontFamily: "inherit", fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{discountLabel(c)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>
                      {c.min_subtotal > 0 ? formatRupiah(c.min_subtotal) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>
                      {c.uses}
                      {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        type="button"
                        onClick={() => toggle(c)}
                        disabled={busy}
                        style={{
                          fontSize: 11,
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid",
                          borderColor: c.is_active ? "var(--gold)" : "var(--border)",
                          background: c.is_active ? "rgba(126,179,232,0.1)" : "transparent",
                          color: c.is_active ? "var(--gold)" : "var(--text-muted)",
                          cursor: "pointer",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        className="admin-btn-delete"
                        onClick={() => remove(c)}
                        title="Hapus"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </td>
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
