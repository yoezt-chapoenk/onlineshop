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
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {ITEMS.map(({ icon: Icon, title, desc }, idx) => (
          <div
            key={title}
            style={{
              display: "flex", alignItems: "flex-start", gap: 16, padding: "32px 24px",
              borderRight: idx !== ITEMS.length - 1 ? "1px solid var(--border)" : "none",
              borderBottom: "none",
            }}
          >
            <div style={{ width: 48, height: 48, background: "var(--surface)", border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
              <Icon style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                {title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
