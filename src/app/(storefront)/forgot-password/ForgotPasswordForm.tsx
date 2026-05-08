"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(forgotPasswordAction, undefined);
  return (
    <form action={action} style={{ background: "var(--surface)", padding: 40, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label htmlFor="email" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
        />
      </div>
      {state?.error && <p style={{ fontSize: 13, color: "var(--error)" }}>{state.error}</p>}
      {state?.success && <p style={{ fontSize: 13, color: "var(--success)" }}>{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", padding: "12px 24px", height: "auto" }}>
        {pending ? t.common.loading : t.auth.sendResetLink}
      </button>
    </form>
  );
}
