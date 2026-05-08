"use client";

import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

const COLLECTIONS = [
  { id: "sunglasses", name: "Sunglasses", count: 24, subtitle: "Polarised & UV400" },
  { id: "optical", name: "Optical", count: 18, subtitle: "Prescription ready" },
  { id: "limited", name: "Limited", count: 6, subtitle: "Archive editions" }
];

export default function CollectionsSection() {
  return (
    <section style={{ padding: "100px 8%", background: "var(--bg2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>Categories</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, color: "var(--text)" }}>
            Shop by Collection
          </h2>
        </div>
        <Link href="/collections" style={{ textDecoration: 'none' }}>
          <button style={{
            background: "none", border: "none", cursor: "pointer", color: "var(--gold)",
            fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-sans)"
          }}>View All →</button>
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
        {COLLECTIONS.map((col) => (
          <Link key={col.id} href={`/collections/${col.id === 'limited' ? 'accessories' : col.id === 'sunglasses' ? 'sunglasses' : 'eyeglasses'}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              position: "relative", background: "var(--surface)", border: "none", cursor: "pointer",
              padding: "56px 40px", textAlign: "left", overflow: "hidden",
              transition: "background 0.3s",
              height: '100%'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.background = "var(--surface2)";}}
            onMouseLeave={(e) => {e.currentTarget.style.background = "var(--surface)";}}>
              <div style={{ marginBottom: 32 }}>
                <GlassesPlaceholder
                  color={col.id === "sunglasses" ? "#c9a96e" : col.id === "optical" ? "#e8ddd0" : "#4a3728"}
                  shape={col.id === "sunglasses" ? "aviator" : col.id === "optical" ? "round" : "cateye"}
                  width={160} height={80} 
                />
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
                {col.count} styles
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "var(--text)", marginBottom: 4 }}>
                {col.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{col.subtitle}</div>
              <div style={{
                position: "absolute", bottom: 24, right: 24,
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid var(--gold-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--gold)", fontSize: 16
              }}>→</div>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(to right, var(--gold), transparent)",
                opacity: 0.4
              }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
