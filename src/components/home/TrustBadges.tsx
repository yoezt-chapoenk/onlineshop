import { Award, ShieldCheck, Truck, Headphones } from "lucide-react";

const ITEMS = [
  {
    icon: Award,
    title: "Kualitas Premium",
    desc: "Material berkualitas tinggi dan pengerjaan yang teliti.",
  },
  {
    icon: ShieldCheck,
    title: "100% Original",
    desc: "Produk asli yang dijamin keasliannya.",
  },
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    desc: "Pengiriman aman dan cepat ke seluruh Indonesia.",
  },
  {
    icon: Headphones,
    title: "Layanan Khusus",
    desc: "Tim layanan pelanggan siap membantu Anda.",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--color-line)]/60">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="shrink-0 h-11 w-11 rounded-xl bg-white border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-navy-900)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1 text-xs sm:text-[13px] text-[color:var(--color-muted)] leading-snug">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
