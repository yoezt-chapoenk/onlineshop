"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan");
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
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>Pesan terkirim</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Terima kasih sudah menghubungi — kami akan membalas dalam satu
              hari kerja. Untuk respons lebih cepat, silakan hubungi via WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn btn-outline"
              style={{ marginTop: 24, padding: "8px 16px", fontSize: 14 }}
            >
              Kirim pesan lain
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
      aria-label="Form kontak"
    >
      <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>Kirim pesan ke kami</h2>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="contact_name">Nama</label>
          <input id="contact_name" name="name" required style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="Nama Anda" />
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="contact_email">Email</label>
          <input id="contact_email" name="email" required type="email" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="anda@email.com" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="contact_subject">Subjek</label>
          <input id="contact_subject" name="subject" required style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }} placeholder="Ada yang bisa kami bantu?" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }} htmlFor="contact_message">Pesan</label>
          <textarea
            id="contact_message"
            name="message"
            required
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)", minHeight: 140, resize: "vertical" }}
            placeholder="Ceritakan sedikit hal yang ingin kami bantu…"
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
        {submitting ? "Mengirim\u2026" : "Kirim pesan"}
      </button>
    </form>
  );
}
