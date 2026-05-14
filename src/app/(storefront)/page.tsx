import Hero from "@/components/home/Hero";
import CollectionsSection from "@/components/home/CollectionsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { getFeaturedSummaries } from "@/lib/data";

export const revalidate = 3600; // revalidate every hour

export default async function HomePage() {
  const featured = await getFeaturedSummaries(4);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Hero />
      <CollectionsSection />
      
      <div style={{ padding: "100px 8% 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>Featured</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, color: "var(--text)" }}>
              New Arrivals
            </h2>
          </div>
          <Link href="/shop" style={{ textDecoration: 'none' }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--gold)",
              fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-sans)"
            }}>View All →</button>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px 28px" }}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      
      <div style={{ padding: "100px 8% 0" }}>
        <NewsletterSection />
      </div>
    </div>
  );
}
