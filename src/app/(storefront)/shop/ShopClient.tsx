"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/products/ProductGrid";
import type { Category, CategorySlug, Gender, Product, Style } from "@/lib/types";

interface Props {
  products: Product[];
  categories: Category[];
}

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

const PRICE_MIN = 50000;
const PRICE_MAX = 300000;

function rupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function ShopClient({
  products: allProducts,
  categories,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Style[]>([]);
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(PRICE_MAX);
  const [sort, setSort] = useState<SortValue>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    allProducts,
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
    setMaxPrice(PRICE_MAX);
  }

  const activeFilters: { label: string; onRemove: () => void }[] = [
    ...selectedCategories.map((slug) => {
      const c = categories.find((x) => x.slug === slug);
      return {
        label: c?.name ?? slug,
        onRemove: () =>
          setSelectedCategories(selectedCategories.filter((x) => x !== slug)),
      };
    }),
    ...selectedGenders.map((g) => ({
      label: g.charAt(0).toUpperCase() + g.slice(1),
      onRemove: () => setSelectedGenders(selectedGenders.filter((x) => x !== g)),
    })),
    ...selectedStyles.map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      onRemove: () => setSelectedStyles(selectedStyles.filter((x) => x !== s)),
    })),
    ...(wholesaleOnly
      ? [{ label: "Wholesale available", onRemove: () => setWholesaleOnly(false) }]
      : []),
    ...(inStockOnly
      ? [{ label: "In stock only", onRemove: () => setInStockOnly(false) }]
      : []),
    ...(maxPrice < PRICE_MAX
      ? [
          {
            label: `Up to ${rupiah(maxPrice)}`,
            onRemove: () => setMaxPrice(PRICE_MAX),
          },
        ]
      : []),
  ];

  const renderFilterPanel = (idPrefix: string) => (
    <div className="space-y-7">
      <div>
        <label className="label" htmlFor={`${idPrefix}-search`}>
          Search
        </label>
        <input
          id={`${idPrefix}-search`}
          className="input"
          placeholder="e.g. aviator, blue light"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <FilterSection title="Category">
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-[color:var(--color-navy-900)]">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.slug)}
                  onChange={() =>
                    toggle(c.slug, selectedCategories, setSelectedCategories)
                  }
                  className="h-4 w-4 accent-[color:var(--color-navy-900)] cursor-pointer"
                />
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-[color:var(--color-muted)]">
                  {c.productCount}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Gender">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <ChipButton
              key={g}
              label={g}
              active={selectedGenders.includes(g)}
              onClick={() => toggle(g, selectedGenders, setSelectedGenders)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <ChipButton
              key={s}
              label={s}
              active={selectedStyles.includes(s)}
              onClick={() => toggle(s, selectedStyles, setSelectedStyles)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Max price">
        <div className="text-xs text-[color:var(--color-muted)] mb-2">
          {rupiah(PRICE_MIN)} —{" "}
          <span className="font-semibold text-[color:var(--color-ink)]">
            {rupiah(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[color:var(--color-navy-900)] cursor-pointer"
        />
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={wholesaleOnly}
              onChange={(e) => setWholesaleOnly(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--color-navy-900)] cursor-pointer"
            />
            Wholesale available
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--color-navy-900)] cursor-pointer"
            />
            In stock only
          </label>
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={clearAll}
        className="btn btn-outline w-full !py-2 text-sm"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Shop"
        title="All Products"
        description="Browse our complete eyewear catalog. Use the filters to find your perfect frame."
        breadcrumbs={[{ label: "Shop" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
            <div className="card p-5">{renderFilterPanel("desktop")}</div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[color:var(--color-line)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden btn btn-outline !py-2 !px-3 text-xs"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-[color:var(--color-navy-900)] text-white text-[10px] font-semibold px-1.5">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
                <div className="text-sm text-[color:var(--color-muted)]">
                  Showing{" "}
                  <span className="font-semibold text-[color:var(--color-ink)]">
                    {filtered.length}
                  </span>{" "}
                  of {allProducts.length} products
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="text-sm text-[color:var(--color-muted)]"
                >
                  Sort by
                </label>
                <select
                  id="sort"
                  className="input !py-1.5 !pr-8 !w-auto text-sm"
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

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={f.onRemove}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-900)] text-xs font-medium border border-[color:var(--color-blue-100)] hover:bg-[color:var(--color-blue-100)] transition-colors"
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-navy-900)] underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            <ProductGrid products={filtered} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[color:var(--color-navy-900)]/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-line)]">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-[color:var(--color-cloud-100)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {renderFilterPanel("mobile")}
            </div>
            <div className="px-5 py-4 border-t border-[color:var(--color-line)]">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="btn btn-primary w-full"
              >
                Show {filtered.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
        active
          ? "bg-[color:var(--color-navy-900)] text-white border-[color:var(--color-navy-900)]"
          : "bg-white text-[color:var(--color-ink)] border-[color:var(--color-line)] hover:border-[color:var(--color-navy-900)] hover:text-[color:var(--color-navy-900)]",
      )}
    >
      {label}
    </button>
  );
}
