"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/products/ProductGrid";
import { products as allProducts, categories } from "@/lib/products";
import type { CategorySlug, Gender, Style } from "@/lib/types";
import clsx from "clsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "best", label: "Best selling" },
  { value: "price-low", label: "Lowest price" },
  { value: "price-high", label: "Highest price" },
  { value: "popular", label: "Most popular" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const GENDERS: Gender[] = ["men", "women", "unisex", "kids"];
const STYLES: Style[] = ["fashion", "casual", "sport", "vintage", "premium"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Style[]>([]);
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [sort, setSort] = useState<SortValue>("newest");

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedGenders.length > 0) {
      list = list.filter((p) => selectedGenders.includes(p.gender));
    }
    if (selectedStyles.length > 0) {
      list = list.filter((p) => selectedStyles.includes(p.style));
    }
    if (wholesaleOnly) {
      list = list.filter((p) => p.priceTiers.length > 0);
    }
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }
    list = list.filter((p) => p.retailPrice <= maxPrice);

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
  }, [
    search,
    selectedCategories,
    selectedGenders,
    selectedStyles,
    wholesaleOnly,
    inStockOnly,
    maxPrice,
    sort,
  ]);

  function toggle<T>(value: T, list: T[], setList: (v: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearAll() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSelectedStyles([]);
    setWholesaleOnly(false);
    setInStockOnly(false);
    setMaxPrice(300000);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Shop"
        title="All Products"
        description="Browse our complete eyewear catalog. Use the filters to find your perfect frame."
        breadcrumbs={[{ label: "Shop" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="card p-5 space-y-6">
              <div>
                <label className="label" htmlFor="search">
                  Search
                </label>
                <input
                  id="search"
                  className="input"
                  placeholder="e.g. aviator, blue light"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Category</h3>
                <ul className="space-y-1.5">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c.slug)}
                          onChange={() =>
                            toggle(c.slug, selectedCategories, setSelectedCategories)
                          }
                          className="h-4 w-4 accent-[color:var(--color-navy-900)]"
                        />
                        <span>{c.name}</span>
                        <span className="ml-auto text-xs text-[color:var(--color-muted)]">
                          {c.productCount}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggle(g, selectedGenders, setSelectedGenders)}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                        selectedGenders.includes(g)
                          ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]"
                          : "bg-white text-[color:var(--color-ink)] border-[color:var(--color-line)] hover:border-[color:var(--color-navy-900)]",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Style</h3>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s, selectedStyles, setSelectedStyles)}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                        selectedStyles.includes(s)
                          ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]"
                          : "bg-white text-[color:var(--color-ink)] border-[color:var(--color-line)] hover:border-[color:var(--color-navy-900)]",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Max price{" "}
                  <span className="text-xs font-normal text-[color:var(--color-muted)]">
                    Rp {maxPrice.toLocaleString("id-ID")}
                  </span>
                </h3>
                <input
                  type="range"
                  min={50000}
                  max={300000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[color:var(--color-navy-900)]"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wholesaleOnly}
                    onChange={(e) => setWholesaleOnly(e.target.checked)}
                    className="h-4 w-4 accent-[color:var(--color-navy-900)]"
                  />
                  Wholesale available
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 accent-[color:var(--color-navy-900)]"
                  />
                  In stock only
                </label>
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="btn btn-ghost w-full !py-2 text-sm"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="text-sm text-[color:var(--color-muted)]">
                Showing{" "}
                <span className="font-semibold text-[color:var(--color-ink)]">
                  {filtered.length}
                </span>{" "}
                of {allProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-[color:var(--color-muted)]">
                  Sort by
                </label>
                <select
                  id="sort"
                  className="input !py-1.5 !pr-8"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ProductGrid products={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}


