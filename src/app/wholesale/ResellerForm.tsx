"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const CHANNELS = [
  "Offline store",
  "TikTok",
  "Shopee",
  "Instagram",
  "WhatsApp",
  "Other",
];

const VOLUMES = [
  "Less than 50 pcs / month",
  "50–200 pcs / month",
  "200–500 pcs / month",
  "500+ pcs / month",
];

export default function ResellerForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Stub — real implementation calls /api/admin/reseller-applications
    setSubmitted(true);
    e.currentTarget.reset();
  }

  if (submitted) {
    return (
      <div className="card p-7">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Application submitted</h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">
              Thanks for applying! Our team will review your application within
              1–2 business days. We&apos;ll reach out via WhatsApp or email when
              your reseller account is ready.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn btn-ghost mt-5 !px-3 !py-2 text-sm"
            >
              Submit another application
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
      aria-label="Reseller application form"
    >
      <h2 className="text-xl font-bold tracking-tight">Become a Reseller</h2>
      <p className="mt-1.5 text-sm text-[color:var(--color-muted)]">
        Approved resellers unlock exclusive pricing across the catalog.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" required className="input" placeholder="Your full name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">WhatsApp number</label>
          <input id="phone" name="phone" required type="tel" className="input" placeholder="08…" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" required type="email" className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" name="city" required className="input" placeholder="e.g. Bandung" />
        </div>
        <div>
          <label className="label" htmlFor="business_name">Business name (optional)</label>
          <input id="business_name" name="business_name" className="input" placeholder="Toko Optik Bahagia" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Selling channels</label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <label
                key={c}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[color:var(--color-line)] bg-white hover:border-[color:var(--color-navy-900)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="selling_channel"
                  value={c}
                  className="h-3.5 w-3.5 accent-[color:var(--color-navy-900)]"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="volume">Estimated monthly order quantity</label>
          <select id="volume" name="estimated_monthly_order" required className="input">
            <option value="">Select an option…</option>
            {VOLUMES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            className="input min-h-[100px] resize-y"
            placeholder="Tell us about your business or any specific products you're interested in."
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full mt-6">
        Submit application
      </button>
      <p className="mt-3 text-xs text-[color:var(--color-muted)] text-center">
        By submitting, you agree to be contacted regarding your application.
      </p>
    </form>
  );
}
