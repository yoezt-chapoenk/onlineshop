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
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      {/* Profile Info */}
      <form action={profileAction} style={{ background: "var(--surface)", padding: 32, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>Informasi Akun</h2>
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
          <p style={{ fontSize: 13, color: "var(--error)" }}>{profileState.error}</p>
        )}
        {profileState?.success && (
          <p style={{ fontSize: 13, color: "var(--success)" }}>{profileState.success}</p>
        )}
        <button type="submit" disabled={profilePending} className="btn btn-primary" style={{ alignSelf: "flex-start", padding: "12px 24px" }}>
          {profilePending ? t.common.loading : t.account.saveProfile}
        </button>
      </form>

      {/* Change Password */}
      <form action={pwAction} style={{ background: "var(--surface)", padding: 32, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>Ganti Password</h2>
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
          <p style={{ fontSize: 13, color: "var(--error)" }}>{pwState.error}</p>
        )}
        {pwState?.success && (
          <p style={{ fontSize: 13, color: "var(--success)" }}>{pwState.success}</p>
        )}
        <button type="submit" disabled={pwPending} className="btn btn-outline" style={{ alignSelf: "flex-start", padding: "12px 24px" }}>
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
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        style={{ width: "100%", background: rest.disabled ? "var(--bg2)" : "var(--bg)", border: "1px solid var(--border)", color: rest.disabled ? "var(--text-muted)" : "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
      />
    </div>
  );
}
