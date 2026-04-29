"use client";

import { useActionState } from "react";
import { saveProfileAction, type ProfileState } from "./actions";
import { t } from "@/lib/i18n";

export default function ProfileForm({
  defaultEmail,
  defaultFullName,
  defaultPhone,
}: {
  defaultEmail: string;
  defaultFullName: string;
  defaultPhone: string;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    saveProfileAction,
    undefined,
  );
  return (
    <form action={action} className="card p-6 space-y-4 max-w-xl">
      <Field
        id="email"
        label={t.auth.email}
        name="email"
        type="email"
        defaultValue={defaultEmail}
        readOnly
        disabled
      />
      <Field
        id="full_name"
        label={t.auth.fullName}
        name="full_name"
        defaultValue={defaultFullName}
        required
        autoComplete="name"
      />
      <Field
        id="phone"
        label={t.auth.phone}
        name="phone"
        type="tel"
        defaultValue={defaultPhone}
        autoComplete="tel"
      />
      {state?.error && <p className="text-sm text-[color:var(--color-error)]">{state.error}</p>}
      {state?.success && <p className="text-sm text-[color:var(--color-success)]">{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t.common.loading : t.account.saveProfile}
      </button>
    </form>
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
        className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm disabled:bg-[color:var(--color-cloud-100)]"
      />
    </div>
  );
}
