"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(forgotPasswordAction, undefined);
  return (
    <form action={action} className="card p-6 space-y-4">
      <div>
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-[color:var(--color-error)]">{state.error}</p>}
      {state?.success && <p className="text-sm text-[color:var(--color-success)]">{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? t.common.loading : t.auth.sendResetLink}
      </button>
    </form>
  );
}
