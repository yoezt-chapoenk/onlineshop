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
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {groups.map((group) => (
        <section key={group} style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em" }}>{group}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {TEXT_FIELDS.filter((f) => f.group === group).map((f) => (
              <label key={f.key} style={{ display: "block" }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>{f.label}</span>
                {f.key === "seo_default_description" || f.key === "store_address" ? (
                  <textarea style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }} rows={3} value={(v[f.key] as string) ?? ""} onChange={(e) => updateText(f.key, e.target.value)} />
                ) : (
                  <input
                    style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
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
      <section style={{ borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.18em" }}>Pembayaran</h2>

        {/* QRIS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>QRIS Image URL</span>
            <input
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
              type="url"
              placeholder="https://example.com/qris.png"
              value={v.payment_qris_url ?? ""}
              onChange={(e) => updateText("payment_qris_url", e.target.value)}
            />
          </label>
          {v.payment_qris_url && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ height: 112, width: 112, borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.payment_qris_url}
                  alt="QRIS Preview"
                  style={{ height: "100%", width: "100%", objectFit: "contain" }}
                />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Preview QR code yang akan ditampilkan di halaman checkout.
              </p>
            </div>
          )}
        </div>

        {/* Bank accounts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>Rekening Bank (Transfer Manual)</span>
            <button
              type="button"
              onClick={addBank}
              className="btn btn-outline"
              style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Tambah Bank
            </button>
          </div>

          {v.payment_banks.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", padding: "12px 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8 }}>
              Belum ada rekening bank. Klik &quot;Tambah Bank&quot; untuk menambahkan.
            </p>
          )}

          {v.payment_banks.map((bank, index) => (
            <div
              key={index}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}
            >
              <label style={{ display: "block" }}>
                {index === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Nama Bank</span>}
                <input
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
                  placeholder="BCA"
                  value={bank.bank}
                  onChange={(e) => updateBank(index, "bank", e.target.value)}
                />
              </label>
              <label style={{ display: "block" }}>
                {index === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Nomor Rekening</span>}
                <input
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
                  placeholder="1234567890"
                  value={bank.number}
                  onChange={(e) => updateBank(index, "number", e.target.value)}
                />
              </label>
              <label style={{ display: "block" }}>
                {index === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Atas Nama</span>}
                <input
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}
                  placeholder="Juragan Grosir"
                  value={bank.name}
                  onChange={(e) => updateBank(index, "name", e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => removeBank(index)}
                style={{ height: 42, width: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--border)", color: "var(--error)", background: "var(--surface)", cursor: "pointer" }}
                title="Hapus"
              >
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {error ? <p style={{ fontSize: 14, color: "var(--error)" }}>{error}</p> : null}
      {savedAt ? <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Saved.</p> : null}

      <div style={{ position: "sticky", bottom: 0, background: "var(--bg)", padding: "16px 0", borderTop: "1px solid var(--border)", zIndex: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
