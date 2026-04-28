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
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-7">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Message sent</h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">
              Thanks for reaching out — we&apos;ll get back to you within one
              business day. For faster responses, please reach us via WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn btn-ghost mt-5 !px-3 !py-2 text-sm"
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-7"
      aria-label="Contact form"
    >
      <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="contact_name">Name</label>
          <input id="contact_name" name="name" required className="input" placeholder="Your name" />
        </div>
        <div>
          <label className="label" htmlFor="contact_email">Email</label>
          <input id="contact_email" name="email" required type="email" className="input" placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="contact_subject">Subject</label>
          <input id="contact_subject" name="subject" required className="input" placeholder="How can we help?" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="contact_message">Message</label>
          <textarea
            id="contact_message"
            name="message"
            required
            className="input min-h-[140px] resize-y"
            placeholder="Tell us a bit about what you need help with…"
          />
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-[color:var(--color-error)]"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full mt-6"
      >
        {submitting ? "Sending\u2026" : "Send message"}
      </button>
    </form>
  );
}
