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
    <div className="relative">
      {/* Floating Action Bar */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-10 mb-4 mx-auto max-w-fit rounded-full bg-white border border-[color:var(--color-navy-900)] shadow-lg px-4 py-3 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-4 fade-in">
          <div className="text-sm font-semibold text-[color:var(--color-navy-900)]">
            {selected.size} order{selected.size > 1 ? "s" : ""} selected
          </div>
          <div className="h-5 w-px bg-[color:var(--color-cloud-200)]" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[color:var(--color-navy-400)]">Change status to:</span>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="input !py-1.5 !pl-3 !pr-8 text-xs min-w-[120px]"
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
            className="btn btn-primary text-xs !py-1.5"
            onClick={handleBulkUpdate}
            disabled={pending}
          >
            {pending ? "Updating..." : "Update"}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-[color:var(--color-error)] text-center">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-navy-400)] bg-[color:var(--color-cloud-100)]">
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selected.size === orders.length}
                    onChange={toggleAll}
                    className="rounded border-[color:var(--color-cloud-300)] text-[color:var(--color-navy-900)] focus:ring-[color:var(--color-navy-900)]"
                  />
                </th>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[color:var(--color-navy-400)]">
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const badge = STATUS_BADGE[o.status];
                  return (
                    <tr
                      key={o.id}
                      className={`border-t border-[color:var(--color-cloud-200)] hover:bg-[color:var(--color-cloud-50)] transition-colors ${
                        selected.has(o.id) ? "bg-[color:var(--color-blue-50)]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(o.id)}
                          onChange={() => toggleRow(o.id)}
                          className="rounded border-[color:var(--color-cloud-300)] text-[color:var(--color-navy-900)] focus:ring-[color:var(--color-navy-900)]"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/admin/orders/${o.id}`} className="text-[color:var(--color-blue-600)] hover:underline">
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>{o.customer_name}</div>
                        <div className="text-xs text-[color:var(--color-navy-400)]">{o.customer_email}</div>
                      </td>
                      <td className="px-4 py-3">{o.item_count}</td>
                      <td className="px-4 py-3 font-semibold">{money(o.total)}</td>
                      <td className="px-4 py-3 uppercase text-xs">{o.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--color-navy-400)]">
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
