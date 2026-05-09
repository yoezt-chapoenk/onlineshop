import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
      <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 700 }}>404</span>
      <h1 style={{ marginTop: 16, fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 48px)", color: "var(--text)" }}>
        We can&apos;t find that page
      </h1>
      <p style={{ marginTop: 16, fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
        The page you&apos;re looking for may have been moved or no longer
        exists. Try the home page or browse our catalog.
      </p>
      <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Home style={{ width: 16, height: 16 }} /> Back to home
        </Link>
        <Link href="/shop" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          Browse products <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    </div>
  );
}
