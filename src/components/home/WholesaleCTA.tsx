import Link from "next/link";
import { ArrowRight, Tags, Users, BadgeCheck } from "lucide-react";

export default function WholesaleCTA() {
  return (
    <section style={{ position: "relative", background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }}>
        <svg
          style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300 }}
          viewBox="0 0 200 200"
        >
          <defs>
            <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
              <circle cx="2" cy="2" r="1.5" fill="var(--text)" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dots)" />
        </svg>
      </div>
      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
            Program Grosir & Reseller
          </span>
          <h2 style={{ marginTop: 16, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>
            Beli lebih banyak, hemat lebih banyak.
          </h2>
          <p style={{ marginTop: 24, fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 480 }}>
            Harga grosir berlaku mulai 6 pcs. Reseller yang disetujui
            mendapatkan harga eksklusif untuk seluruh katalog, dengan prioritas
            stok dan dukungan akun khusus.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Link
              href="/wholesale"
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", fontSize: 13 }}
            >
              Jadi Reseller <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link
              href="/shop"
              className="btn"
              style={{ display: "inline-flex", alignItems: "center", padding: "14px 24px", fontSize: 13, background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              Lihat Harga Grosir
            </Link>
          </div>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: Tags,
              title: "Harga bertingkat mulai 6 pcs",
              desc: "Dua tingkat harga grosir transparan di setiap produk.",
            },
            {
              icon: BadgeCheck,
              title: "Harga khusus reseller",
              desc: "Akun reseller yang disetujui mendapat harga eksklusif.",
            },
            {
              icon: Users,
              title: "Prioritas stok & dukungan",
              desc: "Jalur WhatsApp khusus untuk reseller dan pembeli grosir.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 24 }}
            >
              <div style={{ width: 48, height: 48, background: "var(--bg2)", border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
                <Icon style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
