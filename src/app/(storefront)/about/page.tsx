import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Globe2, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Juragan Grosir is an Indonesian eyewear company crafting premium frames at fair prices for retail customers and wholesale partners.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Our Story"
        title="Premium eyewear, made accessible."
        description="Juragan Grosir was founded with a simple belief — high-quality eyewear shouldn't be a luxury. Today we serve thousands of retail customers and wholesale partners across Indonesia."
        breadcrumbs={[{ label: "About Us" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-14">
          {[
            {
              icon: Users,
              title: "10,000+ customers",
              desc: "Trusted by retail customers and resellers in every Indonesian province.",
            },
            {
              icon: Award,
              title: "Premium materials",
              desc: "Italian acetate, beta-titanium, and TR-90 — sourced from established suppliers.",
            },
            {
              icon: Globe2,
              title: "Nationwide shipping",
              desc: "Live RajaOngkir shipping rates across JNE, J&T, SiCepat, and more.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] flex items-center justify-center text-[color:var(--color-navy-900)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold">{title}</div>
              <p className="mt-1.5 text-sm text-[color:var(--color-muted)] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How we work
            </h2>
            <div className="mt-5 space-y-4 text-[color:var(--color-muted)] leading-relaxed text-[15px]">
              <p>
                We design every Juragan Grosir frame in-house, then partner with
                established eyewear factories to manufacture each piece to spec.
                Every batch is QC&apos;d at our Jakarta warehouse before it
                reaches a customer.
              </p>
              <p>
                Because we ship direct, we can keep retail prices fair and offer
                meaningful discounts at wholesale tiers. That same philosophy
                drives our reseller program — clear pricing, real margins, and
                stock you can count on.
              </p>
              <p>
                We&apos;re a small team based in Jakarta, but we move fast. Most
                orders ship within 24 hours, and our WhatsApp support team
                responds within minutes during business hours.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="btn btn-primary mt-7 inline-flex"
            >
              Become a Reseller <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-7 bg-[color:var(--color-cloud-100)]">
            <h3 className="text-lg font-semibold">Our values</h3>
            <ul className="mt-4 space-y-4">
              {[
                {
                  title: "Honest pricing",
                  desc: "No marketplace markup, no hidden fees. The same retail price online and on every reseller's shelf.",
                },
                {
                  title: "Quality before everything",
                  desc: "Every frame survives a 1,000-flex hinge test, drop test, and 24h UV-exposure check before shipping.",
                },
                {
                  title: "Service that scales with you",
                  desc: "From a first-time customer to a 1,000-piece reseller order — same day support, same care.",
                },
              ].map((v) => (
                <li key={v.title} className="border-l-2 border-[color:var(--color-navy-900)] pl-4">
                  <div className="text-sm font-semibold">{v.title}</div>
                  <p className="text-sm text-[color:var(--color-muted)] mt-1 leading-relaxed">
                    {v.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
