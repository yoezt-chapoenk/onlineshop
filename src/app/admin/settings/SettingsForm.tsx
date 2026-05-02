"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface BankAccount {
  bank: string;
  number: string;
  name: string;
}

export interface Settings {
  store_name: string;
  store_logo_url: string;
  contact_email: string;
  whatsapp_number: string;
  store_address: string;
  biteship_api_key: string;
  origin_postal_code: string;
  payment_banks: BankAccount[];
  payment_qris_url: string;
  pixel_meta_id: string;
  pixel_tiktok_id: string;
  pixel_google_id: string;
  seo_default_title: string;
  seo_default_description: string;
  affiliate_commission_percent: number;
}

const TEXT_FIELDS: { key: keyof Settings; label: string; type?: string; group: string; parseAsNumber?: boolean }[] = [
  { key: "store_name", label: "Store name", group: "Store" },
  { key: "store_logo_url", label: "Logo URL", group: "Store" },
  { key: "contact_email", label: "Contact email", type: "email", group: "Store" },
  { key: "whatsapp_number", label: "WhatsApp number", group: "Store" },
  { key: "store_address", label: "Store address", group: "Store" },
  
  { key: "affiliate_commission_percent", label: "Affiliate Commission (%)", type: "number", group: "Affiliate", parseAsNumber: true },

  { key: "biteship_api_key", label: "Biteship API key", type: "password", group: "Shipping" },
  { key: "origin_postal_code", label: "Origin postal code (kode pos asal)", group: "Shipping" },

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

  function updateText<K extends keyof Settings>(key: K, value: string, parseAsNumber?: boolean) {
    const val = parseAsNumber ? (value === "" ? 0 : parseFloat(value)) : value;
    setV((c) => ({ ...c, [key]: val }));
  }

  // ── Bank management ──
  function addBank() {
    setV((c) => ({
      ...c,
      payment_banks: [...c.payment_banks, { bank: "", number: "", name: "" }],
    }));
  }

  function updateBank(index: number, field: keyof BankAccount, value: string) {
    setV((c) => ({
      ...c,
      payment_banks: c.payment_banks.map((b, i) =>
        i === index ? { ...b, [field]: value } : b,
      ),
    }));
  }

  function removeBank(index: number) {
    setV((c) => ({
      ...c,
      payment_banks: c.payment_banks.filter((_, i) => i !== index),
    }));
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

  const groups = Array.from(new Set(TEXT_FIELDS.map((f) => f.group)));

  return (
    <form onSubmit={submit} className="space-y-6">
      {groups.map((group) => (
        <section key={group} className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-3">
          <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">{group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEXT_FIELDS.filter((f) => f.group === group).map((f) => (
              <label key={f.key} className="block">
                <span className="label">{f.label}</span>
                {f.key === "seo_default_description" || f.key === "store_address" ? (
                  <textarea className="input mt-1" rows={3} value={(v[f.key] as string) ?? ""} onChange={(e) => updateText(f.key, e.target.value)} />
                ) : (
                  <input
                    className="input mt-1"
                    type={f.type ?? "text"}
                    value={(v[f.key] as string|number) ?? ""}
                    onChange={(e) => updateText(f.key, e.target.value, f.parseAsNumber)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      {/* Payment Settings */}
      <section className="rounded-2xl bg-white border border-[color:var(--color-cloud-200)] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.18em]">Pembayaran</h2>

        {/* QRIS */}
        <div className="space-y-2">
          <label className="block">
            <span className="label">QRIS Image URL</span>
            <input
              className="input mt-1"
              type="url"
              placeholder="https://example.com/qris.png"
              value={v.payment_qris_url ?? ""}
              onChange={(e) => updateText("payment_qris_url", e.target.value)}
            />
          </label>
          {v.payment_qris_url && (
            <div className="mt-2 flex items-start gap-3">
              <div className="h-28 w-28 rounded-lg border border-[color:var(--color-cloud-200)] overflow-hidden bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.payment_qris_url}
                  alt="QRIS Preview"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-xs text-[color:var(--color-muted)]">
                Preview QR code yang akan ditampilkan di halaman checkout.
              </p>
            </div>
          )}
        </div>

        {/* Bank accounts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">Rekening Bank (Transfer Manual)</span>
            <button
              type="button"
              onClick={addBank}
              className="btn btn-outline !px-3 !py-1.5 text-xs"
            >
              <Plus className="h-3 w-3" /> Tambah Bank
            </button>
          </div>

          {v.payment_banks.length === 0 && (
            <p className="text-sm text-[color:var(--color-muted)] py-3 text-center border border-dashed border-[color:var(--color-cloud-200)] rounded-xl">
              Belum ada rekening bank. Klik &quot;Tambah Bank&quot; untuk menambahkan.
            </p>
          )}

          {v.payment_banks.map((bank, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end"
            >
              <label className="block">
                {index === 0 && <span className="text-xs text-[color:var(--color-muted)]">Nama Bank</span>}
                <input
                  className="input mt-0.5"
                  placeholder="BCA"
                  value={bank.bank}
                  onChange={(e) => updateBank(index, "bank", e.target.value)}
                />
              </label>
              <label className="block">
                {index === 0 && <span className="text-xs text-[color:var(--color-muted)]">Nomor Rekening</span>}
                <input
                  className="input mt-0.5"
                  placeholder="1234567890"
                  value={bank.number}
                  onChange={(e) => updateBank(index, "number", e.target.value)}
                />
              </label>
              <label className="block">
                {index === 0 && <span className="text-xs text-[color:var(--color-muted)]">Atas Nama</span>}
                <input
                  className="input mt-0.5"
                  placeholder="Juragan Grosir"
                  value={bank.name}
                  onChange={(e) => updateBank(index, "name", e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => removeBank(index)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-[color:var(--color-line)] text-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/5 transition"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

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
