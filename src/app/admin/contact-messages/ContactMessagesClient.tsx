"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/admin/format";

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const STATUSES = ["new", "in-progress", "resolved"];

export default function ContactMessagesClient({ initial }: { initial: Message[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setStatus(id: string, status: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
      {initial.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-8 text-center text-sm text-[color:var(--color-navy-400)]">
          No messages yet.
        </div>
      ) : (
        initial.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[color:var(--color-navy-900)]">{m.subject}</h3>
                <div className="text-sm text-[color:var(--color-navy-700)]">{m.name} · {m.email}</div>
                <div className="text-xs text-[color:var(--color-navy-400)] mt-0.5">{formatDateTime(m.created_at)}</div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-[color:var(--color-navy-700)]">{m.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(m.id, s)}
                    disabled={pending}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize ${m.status === s ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]" : "border-[color:var(--color-cloud-200)] text-[color:var(--color-navy-700)] hover:bg-[color:var(--color-cloud-100)]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
