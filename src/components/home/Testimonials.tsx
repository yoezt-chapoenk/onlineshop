import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Adinda P.",
    role: "Pelanggan retail · Jawa Timur",
    quote:
      "Kualitasnya jauh di atas harganya. Round Gold sekarang jadi frame harian saya — selalu dipuji di setiap meeting.",
    rating: 5,
  },
  {
    name: "Toko Optik Bahagia",
    role: "Reseller · Bandung",
    quote:
      "Harga grosirnya wajar dan stoknya konsisten. Pelanggan kami suka JG Classic Black — kami restock setiap dua minggu.",
    rating: 5,
  },
  {
    name: "Rizky H.",
    role: "Pelanggan retail · Surabaya",
    quote:
      "Pengirimannya lebih cepat dari ekspektasi dan case-nya benar-benar premium. Bluelight Pro menyelamatkan mata saya saat lembur.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section>
      <div className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Dipercaya 10.000+ pelanggan</span>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
          Cerita nyata dari pelanggan kami
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="card p-6 flex flex-col gap-4"
          >
            <div className="flex gap-1 text-[color:var(--color-navy-900)]">
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
