"use client";

import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

export default function Hero() {
  return (
    <section style={{
      height: "100vh", position: "relative", display: "flex", alignItems: "center",
      overflow: "hidden"
    }}>
      {/* Background geometric */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 70% 50%, var(--hero-bg-start) 0%, var(--hero-bg-end) 60%)"
      }} />
      <div style={{
        position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)",
        width: "42vw", height: "42vw", maxWidth: 600, maxHeight: 600,
        borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.08)",
        boxShadow: "0 0 120px 40px rgba(201,169,110,0.04)"
      }} />
      <div style={{
        position: "absolute", right: "12%", top: "50%", transform: "translateY(-50%)",
        width: "28vw", height: "28vw", maxWidth: 400, maxHeight: 400,
        borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.12)"
      }} />

      {/* Product visual */}
      <div style={{
        position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "floatUp 1.2s ease forwards", opacity: 0,
        animationDelay: "0.4s",
        filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.45))",
      }}>
        <div style={{
          background: "transparent",
          border: "none",
          borderRadius: 4, padding: "48px 56px"
        }}>
          <GlassesPlaceholder color="#7eb3e8" shape="oval" width={280} height={140} />
        </div>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>
          Riviera — Matte Noir
        </span>
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 8% 0 8%", maxWidth: 640 }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase",
          marginBottom: 24, animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.1s"
        }}>
          SS 2026 Collection
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(52px, 6vw, 88px)",
          fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em",
          color: "var(--text)", marginBottom: 28,
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.2s"
        }}>
          See the world<br /><em>differently.</em>
        </h1>
        <p style={{
          fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 420,
          marginBottom: 44, fontWeight: 300,
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.3s"
        }}>
          Handcrafted eyewear for those who consider every detail. Italian acetate, Japanese hinges, lifetime craftsmanship.
        </p>
        <div style={{
          display: "flex", gap: 16, alignItems: "center",
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.4s"
        }}>
          <Link href="/shop" style={{ textDecoration: 'none' }}>
            <button style={{
              background: "var(--gold)", color: "var(--bg)",
              border: "none", cursor: "pointer",
              padding: "14px 36px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: "var(--font-sans)", fontWeight: 500,
              transition: "background 0.2s, transform 0.2s"
            }}
            onMouseEnter={(e) => {e.currentTarget.style.background = "var(--gold-light)";e.currentTarget.style.transform = "translateY(-1px)";}}
            onMouseLeave={(e) => {e.currentTarget.style.background = "var(--gold)";e.currentTarget.style.transform = "none";}}>
              Shop Now</button>
          </Link>
          <Link href="/collections" style={{ textDecoration: 'none' }}>
            <button style={{
              background: "none", color: "var(--text-muted)",
              border: "1px solid var(--border)", cursor: "pointer",
              padding: "14px 32px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: "var(--font-sans)", fontWeight: 400,
              transition: "border-color 0.2s, color 0.2s"
            }}
            onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--gold-dim)";e.currentTarget.style.color = "var(--gold)";}}
            onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--border)";e.currentTarget.style.color = "var(--text-muted)";}}>
              View Collections</button>
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "fadeUp 1s ease forwards", opacity: 0, animationDelay: "0.9s"
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--text-dim)", textTransform: "uppercase" }}>Scroll</span>
        <div style={{
          width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold-dim), transparent)",
          animation: "scrollLine 1.6s ease-in-out infinite"
        }} />
      </div>
    </section>
  );
}
