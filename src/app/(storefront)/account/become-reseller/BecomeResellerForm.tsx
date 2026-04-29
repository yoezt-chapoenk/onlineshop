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
    <form action={action} className="card p-6 space-y-4">
      <Field id="contact_name" label="Nama lengkap" name="contact_name" defaultValue={defaultName} required />
      <Field id="business_name" label="Nama usaha / brand" name="business_name" required />
      <Field id="email" label="Email" name="email" type="email" defaultValue={defaultEmail} required />
      <Field id="phone" label="Nomor HP / WhatsApp" name="phone" defaultValue={defaultPhone} required />
      <Field id="city" label="Kota" name="city" required />
      <div>
        <label htmlFor="monthly_volume" className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
          Estimasi pembelian per bulan
        </label>
        <select
          id="monthly_volume"
          name="monthly_volume"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Pilih estimasi
          </option>
          <option value="<50">Kurang dari 50 pcs</option>
          <option value="50-200">50 – 200 pcs</option>
          <option value="200-500">200 – 500 pcs</option>
          <option value=">500">Lebih dari 500 pcs</option>
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
          Catatan tambahan
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-[color:var(--color-error)]">{state.error}</p>}
      {state?.success && <p className="text-sm text-[color:var(--color-success)]">{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t.common.loading : t.account.submitResellerApplication}
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
        className="mt-1 w-full rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-sm"
      />
    </div>
  );
}
