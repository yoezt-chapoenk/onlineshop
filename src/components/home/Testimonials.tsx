import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Adinda P.",
    role: "Retail customer · Jakarta",
    quote:
      "The build quality blew me away for the price. The Round Gold has become my everyday frame — I get compliments at every meeting.",
    rating: 5,
  },
  {
    name: "Toko Optik Bahagia",
    role: "Reseller · Bandung",
    quote:
      "Tiered pricing is fair and the wholesale stock is consistent. Our customers love the JG Classic Black — we restock it every two weeks.",
    rating: 5,
  },
  {
    name: "Rizky H.",
    role: "Retail customer · Surabaya",
    quote:
      "Shipping was faster than I expected and the case is genuinely premium. The Bluelight Pro has saved my eyes during long workdays.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section>
      <div className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Loved by 10,000+ customers</span>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
          Real stories from real customers
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="card p-6 flex flex-col gap-4"
          >
            <div className="flex gap-1 text-[color:var(--color-warning)]">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-[color:var(--color-ink)]">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-auto">
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-[color:var(--color-muted)]">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
