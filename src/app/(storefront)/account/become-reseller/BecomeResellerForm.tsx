"use client";

import { useActionState } from "react";
import { submitResellerAction, type ResellerState } from "./actions";
import { t } from "@/lib/i18n";

export default function BecomeResellerForm({
  defaultEmail,
  defaultName,
  defaultPhone,
}: {
  defaultEmail: string;
  defaultName: string;
  defaultPhone: string;
}) {
  const [state, action, pending] = useActionState<ResellerState, FormData>(
    submitResellerAction,
    undefined,
  );
  return (
    <form action={action} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
      <Field id="contact_name" label="Nama lengkap" name="contact_name" defaultValue={defaultName} required />
      <Field id="business_name" label="Nama usaha / brand" name="business_name" required />
      <Field id="email" label="Email" name="email" type="email" defaultValue={defaultEmail} required />
      <Field id="phone" label="Nomor HP / WhatsApp" name="phone" defaultValue={defaultPhone} required />
      <Field id="city" label="Kota" name="city" required />
      <div>
        <label htmlFor="monthly_volume" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
          Estimasi pembelian per bulan
        </label>
        <select
          id="monthly_volume"
          name="monthly_volume"
          required
          defaultValue=""
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
        >
          <option value="" disabled style={{ background: "var(--surface)", color: "var(--text)" }}>
            Pilih estimasi
          </option>
          <option value="<50" style={{ background: "var(--surface)", color: "var(--text)" }}>Kurang dari 50 pcs</option>
          <option value="50-200" style={{ background: "var(--surface)", color: "var(--text)" }}>50 – 200 pcs</option>
          <option value="200-500" style={{ background: "var(--surface)", color: "var(--text)" }}>200 – 500 pcs</option>
          <option value=">500" style={{ background: "var(--surface)", color: "var(--text)" }}>Lebih dari 500 pcs</option>
        </select>
      </div>
      <div>
        <label htmlFor="notes" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
          Catatan tambahan
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", resize: "vertical" }}
        />
      </div>
      {state?.error && <p style={{ fontSize: 13, color: "var(--error)" }}>{state.error}</p>}
      {state?.success && <p style={{ fontSize: 13, color: "var(--success)" }}>{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary" style={{ padding: "12px 24px", alignSelf: "flex-start" }}>
        {pending ? t.common.loading : t.account.submitResellerApplication}
      </button>
    </form>
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
