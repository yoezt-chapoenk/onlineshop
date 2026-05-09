import type { Metadata } from "next";
import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Koleksi",
  description:
    "Telusuri koleksi kacamata Juragan Grosir — Kacamata Optik, Kacamata Hitam, Blue Light, dan Aksesoris.",
};

export default async function CollectionsPage() {
  const categories = await getCategories();

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "60px 8% 48px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>JURAGAN GROSIR</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 400, color: "var(--text)" }}>Koleksi</h1>
      </div>
      <div style={{ padding: "64px 8%" }}>
        {categories.map((col, idx) => (
          <Link key={col.slug} href={`/shop`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="card-hover" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 0, marginBottom: 2, cursor: "pointer",
              background: "var(--surface)"
            }}>
              
              <div style={{ padding: "64px 8%", display: "flex", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
                    {col.productCount} Styles
                  </div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 3vw, 48px)", fontWeight: 400, color: "var(--text)", marginBottom: 12 }}>
                    {col.name}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>{col.description}</p>
                  <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--gold-dim)", paddingBottom: 2 }}>
                    Shop Now →
                  </span>
                </div>
              </div>
              
              <div style={{
                background: "var(--bg2)", display: "flex", alignItems: "center",
                justifyContent: "center", padding: 48, minHeight: 280
              }}>
                <GlassesPlaceholder
                  color={col.slug === "sunglasses" ? "#c9a96e" : col.slug === "eyeglasses" ? "#e8ddd0" : "#4a3728"}
                  shape={col.slug === "sunglasses" ? "aviator" : col.slug === "eyeglasses" ? "round" : "cat-eye"}
                  width={300} height={150} 
                />
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
