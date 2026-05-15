import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GlassesArt from "@/components/products/GlassesArt";
import type { Category, Product } from "@/lib/types";

interface Props {
  categories: Category[];
  products: Product[];
}

export default function CategoryGrid({ categories, products }: Props) {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Belanja per Kategori
        </h2>
        <Link
          href="/collections"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--gold)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Lihat Semua <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {categories.map((c) => {
          const sample = products.find((p) => p.category === c.slug);
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: 24, minHeight: 200, textDecoration: "none", transition: "border 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--gold)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {c.name}
                  </h3>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>
                    Lihat Koleksi <ArrowRight style={{ width: 12, height: 12 }} />
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "auto", alignSelf: "flex-end", opacity: 0.9 }}>
                {sample && <GlassesArt product={sample} size={110} />}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
