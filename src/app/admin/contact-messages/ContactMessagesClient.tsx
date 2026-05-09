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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error ? <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p> : null}
      {initial.length === 0 ? (
        <div style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          No messages yet.
        </div>
      ) : (
        initial.map((m) => (
          <div key={m.id} style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--text)" }}>{m.subject}</h3>
                <div style={{ fontSize: 14, color: "var(--text)", marginTop: 2 }}>{m.name} · {m.email}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{formatDateTime(m.created_at)}</div>
                <p style={{ marginTop: 12, fontSize: 14, whiteSpace: "pre-wrap", color: "var(--text)" }}>{m.message}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(m.id, s)}
                    disabled={pending}
                    style={{
                      fontSize: 12, padding: "6px 12px", borderRadius: 999, border: "1px solid", fontWeight: 500, textTransform: "capitalize", cursor: "pointer",
                      ...(m.status === s
                        ? { background: "var(--gold)", color: "var(--bg)", borderColor: "var(--gold)" }
                        : { background: "transparent", color: "var(--text)", borderColor: "var(--border)" })
                    }}
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
