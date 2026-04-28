"use client";

import { useState, useTransition } from "react";

export interface Settings {
  store_name: string;
  store_logo_url: string;
  contact_email: string;
  whatsapp_number: string;
  store_address: string;
  rajaongkir_api_key: string;
  rajaongkir_payment_settings: string;
  default_origin_id: string;
  default_origin_pinpoint: string;
  pixel_meta_id: string;
  pixel_tiktok_id: string;
  pixel_google_id: string;
  seo_default_title: string;
  seo_default_description: string;
}

const FIELDS: { key: keyof Settings; label: string; type?: string; group: string }[] = [
  { key: "store_name", label: "Store name", group: "Store" },
  { key: "store_logo_url", label: "Logo URL", group: "Store" },
  { key: "contact_email", label: "Contact email", type: "email", group: "Store" },
  { key: "whatsapp_number", label: "WhatsApp number", group: "Store" },
  { key: "store_address", label: "Store address", group: "Store" },

  { key: "rajaongkir_api_key", label: "RajaOngkir API key", type: "password", group: "Shipping & payment" },
  { key: "rajaongkir_payment_settings", label: "RajaOngkir payment settings (JSON)", group: "Shipping & payment" },
  { key: "default_origin_id", label: "Default origin ID", group: "Shipping & payment" },
  { key: "default_origin_pinpoint", label: "Default origin pinpoint", group: "Shipping & payment" },

  { key: "pixel_meta_id", label: "Meta Pixel ID", group: "Tracking & SEO" },
  { key: "pixel_tiktok_id", label: "TikTok Pixel ID", group: "Tracking & SEO" },
  { key: "pixel_google_id", label: "Google Tag ID", group: "Tracking & SEO" },
  { key: "seo_default_title", label: "Default SEO title", group: "Tracking & SEO" },
  { key: "seo_default_description", label: "Default SEO description", group: "Tracking & SEO" },
];

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [v, setV] = useState<Settings>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setV((c) => ({ ...c, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Save failed (${res.status})`);
        return;
      }
      setSavedAt(Date.now());
    });
  }

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <form onSubmit={submit} className="space-y-6">
      {groups.map((group) => (
        <section key={group} className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
          <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">{group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FIELDS.filter((f) => f.group === group).map((f) => (
              <label key={f.key} className="block">
                <span className="label">{f.label}</span>
                {f.key === "seo_default_description" || f.key === "store_address" || f.key === "rajaongkir_payment_settings" ? (
                  <textarea className="input mt-1" rows={3} value={v[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} />
                ) : (
                  <input
                    className="input mt-1"
                    type={f.type ?? "text"}
                    value={v[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      {error ? <p className="text-sm text-[color:var(--color-error)]">{error}</p> : null}
      {savedAt ? <p className="text-sm text-[color:var(--color-navy-700)]">Saved.</p> : null}

      <div className="sticky bottom-0 bg-[color:var(--color-cloud-100)] py-3 border-t border-[color:var(--color-cloud-200)] -mx-5 sm:-mx-8 px-5 sm:px-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
