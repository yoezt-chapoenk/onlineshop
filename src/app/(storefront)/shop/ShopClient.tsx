"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/products/ProductCard";
import type { Category, CategorySlug, Gender, Product, Style } from "@/lib/types";

interface Props {
  products: Product[];
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "best", label: "Paling laris" },
  { value: "price-low", label: "Harga termurah" },
  { value: "price-high", label: "Harga tertinggi" },
  { value: "popular", label: "Paling populer" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function rupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function ShopClient({
  products: allProducts,
  categories,
}: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortValue>("newest");

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (filter !== "All") {
      list = list.filter((p) => p.category === filter);
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.retailPrice - b.retailPrice);
        break;
      case "price-high":
        list.sort((a, b) => b.retailPrice - a.retailPrice);
        break;
      case "best":
        list.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
        break;
      case "popular":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
      default:
        list.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
    }
    return list;
  }, [allProducts, filter, sort]);

  const cats = ["All", ...categories.map(c => c.slug)];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      <PageHeader
        eyebrow="Shop"
        title="All Eyewear"
        description="Telusuri seluruh katalog kacamata kami. Gunakan filter untuk menemukan frame favorit Anda."
        breadcrumbs={[{ label: "Belanja" }]}
      />

      <div style={{ padding: "48px 8%" }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
          marginBottom: 48, gap: 24, borderBottom: "1px solid var(--border)", paddingBottom: 24
        }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cats.map((c) => {
              const label = c === "All" ? "Semua" : categories.find(cat => cat.slug === c)?.name || c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{
                    background: filter === c ? "var(--gold)" : "none",
                    border: `1px solid ${filter === c ? "var(--gold)" : "var(--border)"}`,
                    color: filter === c ? "var(--bg)" : "var(--text-muted)",
                    padding: "8px 20px",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.2s"
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              {filtered.length} products
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                padding: "8px 16px",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "var(--surface)", color: "var(--text)" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "120px 0", color: "var(--text-dim)" }}>
            No products found.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "56px 32px"
          }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
