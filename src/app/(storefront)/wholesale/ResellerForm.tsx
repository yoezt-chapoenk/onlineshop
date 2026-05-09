"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const CHANNELS = [
  "Toko offline",
  "TikTok",
  "Shopee",
  "Instagram",
  "WhatsApp",
  "Lainnya",
];

const VOLUMES = [
  "Kurang dari 50 pcs / bulan",
  "50–200 pcs / bulan",
  "200–500 pcs / bulan",
  "500+ pcs / bulan",
];

export default function ResellerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const channels = data.getAll("selling_channel").map(String).filter(Boolean);
    const notesRaw = String(data.get("notes") ?? "").trim();
    const businessNameRaw = String(data.get("business_name") ?? "").trim();
    const fullName = String(data.get("full_name") ?? "");
    const composedNotes = [
      channels.length > 0 ? `Kanal: ${channels.join(", ")}` : "",
      notesRaw,
    ]
      .filter(Boolean)
      .join("\n\n");
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reseller-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessNameRaw || fullName,
          contactName: fullName,
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          city: String(data.get("city") ?? ""),
          monthlyVolume: String(data.get("estimated_monthly_order") ?? ""),
          notes: composedNotes || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim aplikasi",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--gold)", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(52, 168, 83, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
            <CheckCircle2 style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>Aplikasi terkirim</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Terima kasih sudah mendaftar! Tim kami akan meninjau aplikasi
              Anda dalam 1–2 hari kerja. Kami akan menghubungi via WhatsApp
              atau email saat akun reseller Anda siap.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn btn-outline"
              style={{ marginTop: 24, padding: "8px 16px", fontSize: 14 }}
            >
              Kirim aplikasi lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}
      aria-label="Form aplikasi reseller"
    >
      <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>Jadi Reseller</h2>
      <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>
        Reseller yang disetujui mendapat harga eksklusif di seluruh katalog.
      </p>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="full_name">Nama lengkap</label>
          <input id="full_name" name="full_name" required style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="Nama lengkap Anda" />
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="phone">Nomor WhatsApp</label>
          <input id="phone" name="phone" required type="tel" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="08…" />
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="email">Email</label>
          <input id="email" name="email" required type="email" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="anda@email.com" />
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="city">Kota</label>
          <input id="city" name="city" required style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="contoh: Bandung" />
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="business_name">Nama bisnis (opsional)</label>
          <input id="business_name" name="business_name" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="Toko Optik Bahagia" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>Kanal jualan</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CHANNELS.map((c) => (
              <label
                key={c}
                className="channel-label"
              >
                <input
                  type="checkbox"
                  name="selling_channel"
                  value={c}
                  style={{ width: 14, height: 14, accentColor: "var(--gold)" }}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="volume">Estimasi pemesanan bulanan</label>
          <select id="volume" name="estimated_monthly_order" required style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}>
            <option value="">Pilih salah satu…</option>
            {VOLUMES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="notes">Catatan (opsional)</label>
          <textarea
            id="notes"
            name="notes"
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", minHeight: 100, resize: "vertical" }}
            placeholder="Ceritakan tentang bisnis Anda atau produk yang ingin Anda jual."
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          style={{ marginTop: 16, fontSize: 14, color: "var(--error)" }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 32 }}
      >
        {submitting ? "Mengirim\u2026" : "Kirim aplikasi"}
      </button>
      <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Dengan mengirim form ini, Anda setuju untuk dihubungi terkait aplikasi.
      </p>
    </form>
  );
}
