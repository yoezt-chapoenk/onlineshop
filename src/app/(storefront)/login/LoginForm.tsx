"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "../auth/actions";
import { t } from "@/lib/i18n";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  return (
    <div className="card p-6 space-y-4">
      {/* Google Sign In */}
      <GoogleButton label="Masuk dengan Google" />

      <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted)]">
        <div className="flex-1 border-t border-[color:var(--color-line)]" />
        atau masuk dengan email
        <div className="flex-1 border-t border-[color:var(--color-line)]" />
      </div>

      <form action={action} className="space-y-4">
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
        <div>
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
            {t.auth.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-[color:var(--color-error)]">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t.common.loading : t.auth.loginCta}
        </button>
        <div className="text-center text-xs">
          <Link href="/forgot-password" className="text-[color:var(--color-muted)] hover:underline">
            {t.auth.forgotPassword}
          </Link>
        </div>
      </form>
    </div>
  );
}
