"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "reseller" | "wholesale" | "admin";
  reseller_status: "none" | "pending" | "approved" | "rejected";
  created_at: string;
  created_at_human?: string;
}

const ROLES: UserRow["role"][] = ["customer", "reseller", "wholesale", "admin"];

const ROLE_TONE: Record<UserRow["role"], string> = {
  customer: "var(--text-muted)",
  reseller: "var(--gold)",
  wholesale: "var(--gold-light)",
  admin: "var(--error)",
};

export default function UsersClient({ rows }: { rows: UserRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setRole(id: string, role: UserRow["role"]) {
    if (role === "admin" && !confirm("Promote user to admin? They will have full dashboard access.")) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error ?? `Failed (${res.status})`);
      return;
    }
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        No users match these filters.
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{ padding: 12, color: "var(--error)", fontSize: 13, border: "1px solid var(--error)", borderRadius: 8 }}>
          {error}
        </div>
      )}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                <th style={{ padding: "10px 16px" }}>User</th>
                <th style={{ padding: "10px 16px" }}>Role</th>
                <th style={{ padding: "10px 16px" }}>Reseller status</th>
                <th style={{ padding: "10px 16px" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text)" }}>
                    <div style={{ fontWeight: 600 }}>{u.full_name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value as UserRow["role"])}
                      disabled={busyId === u.id}
                      style={{
                        padding: "6px 10px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: ROLE_TONE[u.role],
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
                    {u.reseller_status}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                    {u.created_at_human ?? u.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
