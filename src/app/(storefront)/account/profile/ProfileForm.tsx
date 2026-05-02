"use client";

import { useActionState } from "react";
import { saveProfileAction, changePasswordAction, type ProfileState } from "./actions";
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
  const [profileState, profileAction, profilePending] = useActionState<ProfileState, FormData>(
    saveProfileAction,
    undefined,
  );
  const [pwState, pwAction, pwPending] = useActionState<ProfileState, FormData>(
    changePasswordAction,
    undefined,
  );

  return (
    <div className="space-y-6 max-w-xl">
      {/* Profile Info */}
      <form action={profileAction} className="card p-6 space-y-4">
        <h2 className="text-base font-semibold">Informasi Akun</h2>
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
        {profileState?.error && (
          <p className="text-sm text-[color:var(--color-error)]">{profileState.error}</p>
        )}
        {profileState?.success && (
          <p className="text-sm text-[color:var(--color-success)]">{profileState.success}</p>
        )}
        <button type="submit" disabled={profilePending} className="btn btn-primary">
          {profilePending ? t.common.loading : t.account.saveProfile}
        </button>
      </form>

      {/* Change Password */}
      <form action={pwAction} className="card p-6 space-y-4">
        <h2 className="text-base font-semibold">Ganti Password</h2>
        <Field
          id="password"
          label="Password Baru"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
        />
        <Field
          id="confirm"
          label="Konfirmasi Password Baru"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Ulangi password baru"
        />
        {pwState?.error && (
          <p className="text-sm text-[color:var(--color-error)]">{pwState.error}</p>
        )}
        {pwState?.success && (
          <p className="text-sm text-[color:var(--color-success)]">{pwState.success}</p>
        )}
        <button type="submit" disabled={pwPending} className="btn btn-outline">
          {pwPending ? t.common.loading : "Simpan Password Baru"}
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]"
      >
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
