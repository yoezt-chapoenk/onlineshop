import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Tags, Truck, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ResellerForm from "./ResellerForm";

export const metadata: Metadata = {
  title: "Become a Reseller",
  description:
    "Apply to become an approved Juragan Grosir reseller — unlock exclusive pricing, priority stock, and dedicated support.",
};

const PERKS = [
  {
    icon: Tags,
    title: "Exclusive reseller pricing",
    desc: "Unlock our lowest pricing across the entire catalog after approval.",
  },
  {
    icon: BadgeCheck,
    title: "Priority new arrivals",
    desc: "Get early access to new collections before they hit the public catalog.",
  },
  {
    icon: Truck,
    title: "Bulk-friendly shipping",
    desc: "Optimized packaging and consolidated shipments for resellers.",
  },
  {
    icon: Users,
    title: "Dedicated reseller line",
    desc: "Direct WhatsApp line for stock, restock, and order questions.",
  },
];

export default function WholesalePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Wholesale & Reseller"
        title="Grow your eyewear business with us."
        description="Tiered wholesale pricing kicks in from 6 pieces. Approved resellers unlock our exclusive lowest pricing across the catalog."
        breadcrumbs={[{ label: "Wholesale" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)] gap-10 lg:gap-14">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Why partner with us</h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="card p-5 flex items-start gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] flex items-center justify-center text-[color:var(--color-navy-900)] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{title}</div>
                  <p className="text-xs text-[color:var(--color-muted)] mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 card p-6">
            <h3 className="text-base font-semibold">How it works</h3>
            <ol className="mt-4 space-y-4">
              {[
                {
                  step: "01",
                  title: "Submit the application",
                  desc: "Tell us about your business and selling channels — takes about 2 minutes.",
                },
                {
                  step: "02",
                  title: "We review within 1–2 business days",
                  desc: "Our team checks your details and may contact you for a quick verification call.",
                },
                {
                  step: "03",
                  title: "Get approved & start ordering",
                  desc: "Reseller pricing is automatically applied to your account on every order.",
                },
              ].map((s) => (
                <li key={s.step} className="flex gap-4">
                  <div className="text-xs font-bold text-[color:var(--color-navy-900)] mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.title}</div>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 text-xs text-[color:var(--color-muted)] flex items-center gap-1">
              Questions? <ArrowRight className="h-3 w-3" /> Reach our team via the form or WhatsApp.
            </div>
          </div>
        </div>

        <ResellerForm />
      </div>
    </div>
  );
}
