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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error ? <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p> : null}
      {items.length === 0 ? (
        <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          No applications yet.
        </div>
      ) : (
        items.map((a) => (
          <div key={a.id} style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontWeight: 700, color: "var(--text)" }}>{a.business_name}</h3>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500, textTransform: "capitalize", background: "var(--bg2)", color: "var(--text)" }}>
                    {a.status}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text)", marginTop: 2 }}>
                  {a.contact_name} · {a.email} · {a.phone}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {a.city} · {a.monthly_volume} · {formatDateTime(a.created_at)}
                </div>
                {a.notes ? (
                  <p style={{ marginTop: 12, fontSize: 14, color: "var(--text)" }}>{a.notes}</p>
                ) : null}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(a.id, s)}
                    disabled={pending}
                    style={{
                      fontSize: 12, padding: "6px 12px", borderRadius: 999, border: "1px solid", fontWeight: 500, textTransform: "capitalize", cursor: "pointer",
                      ...(a.status === s
                        ? { background: "var(--gold)", color: "var(--bg)", borderColor: "var(--gold)" }
                        : { background: "transparent", color: "var(--text)", borderColor: "var(--border)" })
                    }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  style={{ fontSize: 12, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text)", background: "transparent", cursor: "pointer" }}
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                >
                  Note
                </button>
              </div>
            </div>
            {openId === a.id ? (
              <div style={{ marginTop: 12 }}>
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
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                Last reviewed {formatDateTime(a.reviewed_at)}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
