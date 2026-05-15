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
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 16 }}>Dipercaya 10.000+ pelanggan</span>
        <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Cerita nyata dari pelanggan kami
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            style={{ display: "flex", flexDirection: "column", gap: 24, background: "var(--surface)", border: "1px solid var(--border)", padding: 32, margin: 0 }}
          >
            <div style={{ display: "flex", gap: 4, color: "var(--gold)" }}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} style={{ width: 16, height: 16, fill: "currentColor" }} />
              ))}
            </div>
            <blockquote style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-muted)", margin: 0 }}>
              “{t.quote}”
            </blockquote>
            <figcaption style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
