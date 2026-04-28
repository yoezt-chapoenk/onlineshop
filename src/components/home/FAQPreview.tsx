import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FAQS = [
  {
    q: "How does wholesale pricing work?",
    a: "Tiered pricing automatically applies once you reach the minimum quantity (typically 6 pcs). Tier 2 unlocks at 12+ pcs. Approved resellers always see reseller pricing across the catalog.",
  },
  {
    q: "How is shipping calculated?",
    a: "We integrate RajaOngkir/Komerce to calculate live courier rates based on your destination and total order weight. You choose the courier and service before payment.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Bank Transfer, Virtual Account, QRIS, and other channels available via our Komerce payment provider. All payments are processed securely on-website.",
  },
  {
    q: "Do you ship across Indonesia?",
    a: "Yes — we ship to all Indonesian provinces using JNE, J&T, SiCepat, and other major couriers. Tracking numbers are sent automatically once your order is shipped.",
  },
  {
    q: "Can I become a reseller?",
    a: "Absolutely. Submit the Become a Reseller form with your selling channels and estimated monthly volume. Our team reviews applications within 1–2 business days.",
  },
];

export default function FAQPreview() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div>
          <span className="eyebrow">Frequently Asked</span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            Quick answers to common questions
          </h2>
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            Have a different question? Reach our team via WhatsApp or the
            contact form.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            Contact support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="lg:col-span-2">
          <ul className="divide-y divide-[color:var(--color-line)] border border-[color:var(--color-line)] rounded-xl bg-white">
            {FAQS.map((f) => (
              <li key={f.q}>
                <details className="group p-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <span className="text-sm sm:text-[15px] font-semibold text-[color:var(--color-ink)]">
                      {f.q}
                    </span>
                    <span className="h-6 w-6 shrink-0 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-navy-900)] group-open:rotate-45 transition-transform text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-[color:var(--color-muted)] leading-relaxed">
                    {f.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
