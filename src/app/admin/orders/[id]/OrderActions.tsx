"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/format";

const STATUS_LABEL_ID: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  processing: "Diproses",
  packed: "Dikemas",
  shipped: "Dikirim",
  fulfilled: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

interface Props {
  orderId: string;
  status: OrderStatus;
  tracking_courier: string;
  tracking_number: string;
  admin_note: string;
  payment_method: string;
  weight_gram: number;
}

export default function OrderActions({
  orderId,
  status: initialStatus,
  tracking_courier: initialCourier,
  tracking_number: initialNumber,
  admin_note: initialNote,
  payment_method,
  weight_gram,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [courier, setCourier] = useState(initialCourier);
  const [number, setNumber] = useState(initialNumber);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_courier: courier,
          tracking_number: number,
          admin_note: note,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Save failed (${res.status})`);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>
          Fulfillment
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Status</span>
            <select
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              disabled={pending}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL_ID[s] ?? s}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Tracking courier</span>
            <input
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="JNE / J&T / SiCepat"
              disabled={pending}
            />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Tracking number</span>
            <input
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="AWB / receipt"
              disabled={pending}
            />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Admin note (internal)</span>
            <textarea
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={pending}
            />
          </label>
          {error ? (
            <p style={{ fontSize: 12, color: "var(--error)" }}>{error}</p>
          ) : null}
          {savedAt ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Saved.</p>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            onClick={save}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20, fontSize: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
          Payment
        </h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>Method</span>
          <span style={{ textTransform: "uppercase", fontWeight: 600, color: "var(--text)" }}>{payment_method}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>Total weight</span>
          <span style={{ color: "var(--text)" }}>{weight_gram} g</span>
        </div>
        <div style={{ marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, flex: 1, justifyContent: "center" }}
            onClick={() => window.print()}
          >
            Print invoice
          </button>
          <a
            href={`/api/admin/orders/${orderId}/packing-slip`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ fontSize: 12, flex: 1, justifyContent: "center", textAlign: "center" }}
          >
            Packing slip
          </a>
        </div>
      </div>
    </aside>
  );
}
