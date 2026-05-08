"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  return (
    <div style={{ background: "var(--surface)", padding: 40, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Google Sign In */}
      <GoogleButton label="Masuk dengan Google" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
        <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
        atau masuk dengan email
        <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
      </div>

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
        <div>
          <label htmlFor="password" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
            {t.auth.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
          />
        </div>
        {state?.error && (
          <p style={{ fontSize: 13, color: "var(--error)" }}>{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", padding: "12px 24px", height: "auto" }}>
          {pending ? t.common.loading : t.auth.loginCta}
        </button>
        <div style={{ textAlign: "center", fontSize: 12, marginTop: 12 }}>
          <Link href="/forgot-password" style={{ color: "var(--text-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            {t.auth.forgotPassword}
          </Link>
        </div>
      </form>
    </div>
  );
}
