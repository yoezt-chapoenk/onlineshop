"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/admin/format";

export interface Application {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  monthly_volume: string;
  notes: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUSES = ["new", "approved", "rejected"];

const STATUS_BADGE: Record<string, string> = {
  new: "bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-900)]",
  approved: "bg-[color:var(--color-navy-900)] text-white",
  rejected: "bg-[color:var(--color-cloud-300)] text-[color:var(--color-ink)]",
};

export default function ResellerAppsClient({ initial }: { initial: Application[] }) {
  const router = useRouter();
  const [items] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(
    () => Object.fromEntries(initial.map((a) => [a.id, a.admin_note ?? ""])),
  );
  const [error, setError] = useState<string | null>(null);

  function setStatus(id: string, status: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/reseller-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_note: notes[id] ?? "" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Save failed (${res.status})`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-[color:var(--color-error)]">{error}</p> : null}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-8 text-center text-sm text-[color:var(--color-navy-400)]">
          No applications yet.
        </div>
      ) : (
        items.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[color:var(--color-navy-900)]">{a.business_name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[a.status] ?? STATUS_BADGE.new}`}>
                    {a.status}
                  </span>
                </div>
                <div className="text-sm text-[color:var(--color-navy-700)]">
                  {a.contact_name} · {a.email} · {a.phone}
                </div>
                <div className="text-xs text-[color:var(--color-navy-400)] mt-1">
                  {a.city} · {a.monthly_volume} · {formatDateTime(a.created_at)}
                </div>
                {a.notes ? (
                  <p className="mt-3 text-sm text-[color:var(--color-navy-700)]">{a.notes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(a.id, s)}
                    disabled={pending}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize ${a.status === s ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]" : "border-[color:var(--color-cloud-200)] text-[color:var(--color-navy-700)] hover:bg-[color:var(--color-cloud-100)]"}`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-full border border-[color:var(--color-cloud-200)] text-[color:var(--color-navy-700)] hover:bg-[color:var(--color-cloud-100)]"
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                >
                  Note
                </button>
              </div>
            </div>
            {openId === a.id ? (
              <div className="mt-3">
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Internal admin note"
                  value={notes[a.id] ?? ""}
                  onChange={(e) => setNotes((c) => ({ ...c, [a.id]: e.target.value }))}
                />
              </div>
            ) : null}
            {a.reviewed_at ? (
              <div className="mt-2 text-xs text-[color:var(--color-navy-400)]">
                Last reviewed {formatDateTime(a.reviewed_at)}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
