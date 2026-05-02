"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";
import GoogleButton from "@/components/auth/GoogleButton";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, undefined);
  return (
    <div className="card p-6 space-y-4">
      {/* Google Sign Up */}
      <GoogleButton label="Daftar dengan Google" />

      <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted)]">
        <div className="flex-1 border-t border-[color:var(--color-line)]" />
        atau daftar dengan email
        <div className="flex-1 border-t border-[color:var(--color-line)]" />
      </div>

      <form action={action} className="space-y-4">
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
        {state?.error && <p className="text-sm text-[color:var(--color-error)]">{state.error}</p>}
        {state?.success && <p className="text-sm text-[color:var(--color-success)]">{state.success}</p>}
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t.common.loading : t.auth.registerCta}
        </button>
      </form>
    </div>
  );
}

function Field({ id, label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
      />
    </div>
  );
}
