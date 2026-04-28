"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/format";

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
    <aside className="space-y-4">
      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
        <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em] mb-3">
          Fulfillment
        </h2>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="label">Status</span>
            <select
              className="input mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              disabled={pending}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Tracking courier</span>
            <input
              className="input mt-1"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="JNE / J&T / SiCepat"
              disabled={pending}
            />
          </label>
          <label className="block">
            <span className="label">Tracking number</span>
            <input
              className="input mt-1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="AWB / receipt"
              disabled={pending}
            />
          </label>
          <label className="block">
            <span className="label">Admin note (internal)</span>
            <textarea
              className="input mt-1"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={pending}
            />
          </label>
          {error ? (
            <p className="text-xs text-[color:var(--color-error)]">{error}</p>
          ) : null}
          {savedAt ? (
            <p className="text-xs text-[color:var(--color-navy-400)]">Saved.</p>
          ) : null}
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={save}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 text-sm space-y-2">
        <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">
          Payment
        </h2>
        <div className="flex justify-between">
          <span className="text-[color:var(--color-navy-400)]">Method</span>
          <span className="uppercase">{payment_method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[color:var(--color-navy-400)]">Total weight</span>
          <span>{weight_gram} g</span>
        </div>
        <div className="pt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline text-xs"
            onClick={() => window.print()}
          >
            Print invoice
          </button>
          <a
            href={`/api/admin/orders/${orderId}/packing-slip`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline text-xs"
          >
            Packing slip
          </a>
        </div>
      </div>
    </aside>
  );
}
