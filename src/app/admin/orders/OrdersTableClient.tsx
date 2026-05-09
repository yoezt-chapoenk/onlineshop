"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  money,
  formatDateTime,
  STATUS_BADGE,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/admin/format";

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  item_count: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
}

export default function OrdersTableClient({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [targetStatus, setTargetStatus] = useState<string>("processing");
  const [error, setError] = useState<string | null>(null);

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleBulkUpdate = () => {
    if (selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selected),
          status: targetStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Update failed (${res.status})`);
        return;
      }

      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Floating Action Bar */}
      {selected.size > 0 && (
        <div style={{ position: "sticky", top: 16, zIndex: 10, marginBottom: 16, marginInline: "auto", width: "fit-content", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--gold)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {selected.size} order{selected.size > 1 ? "s" : ""} selected
          </div>
          <div style={{ height: 20, width: 1, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Change status to:</span>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              style={{ padding: "6px 24px 6px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, fontSize: 12, minWidth: 120 }}
              disabled={pending}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={handleBulkUpdate}
            disabled={pending}
          >
            {pending ? "Updating..." : "Update"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16, fontSize: 14, color: "var(--error)", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", width: 40, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selected.size === orders.length}
                    onChange={toggleAll}
                    style={{ accentColor: "var(--gold)" }}
                  />
                </th>
                <th style={{ padding: "12px 16px" }}>Order #</th>
                <th style={{ padding: "12px 16px" }}>Customer</th>
                <th style={{ padding: "12px 16px" }}>Items</th>
                <th style={{ padding: "12px 16px" }}>Total</th>
                <th style={{ padding: "12px 16px" }}>Payment</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const badge = STATUS_BADGE[o.status];
                  return (
                    <tr
                      key={o.id}
                      style={{ borderBottom: "1px solid var(--border)", background: selected.has(o.id) ? "rgba(201,169,110,0.05)" : "transparent", transition: "background 0.2s" }}
                      className="hover:bg-[var(--bg2)]"
                    >
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selected.has(o.id)}
                          onChange={() => toggleRow(o.id)}
                          style={{ accentColor: "var(--gold)" }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>
                        <Link href={`/admin/orders/${o.id}`} style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
                          {o.order_number}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "var(--text)", fontWeight: 500 }}>{o.customer_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.customer_email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text)" }}>{o.item_count}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{money(o.total)}</td>
                      <td style={{ padding: "12px 16px", textTransform: "uppercase", fontSize: 12, color: "var(--text)" }}>{o.payment_method}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: "var(--bg2)", color: "var(--text)" }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                        {formatDateTime(o.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
