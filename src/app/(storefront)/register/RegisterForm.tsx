"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";
import GoogleButton from "@/components/auth/GoogleButton";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, undefined);
  return (
    <div style={{ background: "var(--surface)", padding: 40, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Google Sign Up */}
      <GoogleButton label="Daftar dengan Google" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
        <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
        atau daftar dengan email
        <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
      </div>

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field id="full_name" label={t.auth.fullName} name="full_name" required autoComplete="name" />
        <Field id="email" label={t.auth.email} name="email" type="email" required autoComplete="email" />
        <Field id="phone" label={t.auth.phone} name="phone" type="tel" autoComplete="tel" />
        <Field id="password" label={t.auth.password} name="password" type="password" required autoComplete="new-password" />
        <Field
          id="confirm_password"
          label={t.auth.confirmPassword}
          name="confirm_password"
          type="password"
          required
          autoComplete="new-password"
        />
        {state?.error && <p style={{ fontSize: 13, color: "var(--error)" }}>{state.error}</p>}
        {state?.success && <p style={{ fontSize: 13, color: "var(--success)" }}>{state.success}</p>}
        <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", padding: "12px 24px", height: "auto" }}>
          {pending ? t.common.loading : t.auth.registerCta}
        </button>
      </form>
    </div>
  );
}

function Field({ id, label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
        {label}
      </label>
      <input
        id={id}
        {...rest}
        style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
      />
    </div>
  );
}
