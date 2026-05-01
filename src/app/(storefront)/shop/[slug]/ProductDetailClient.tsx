"use client";

import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import GlassesArt from "@/components/products/GlassesArt";

interface Props {
  product: Product;
}

type Axis = "color" | "type" | "size";

const AXIS_LABEL: Record<Axis, string> = {
  color: "Warna",
  type: "Tipe",
  size: "Ukuran",
};

function uniq(values: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

export default function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { isReseller } = useSession();
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const hasVariants = variants.length > 0;

  // Which axes this product actually uses (hide empty ones).
  const axes = useMemo<Axis[]>(() => {
    const list: Axis[] = [];
    if (variants.some((v) => v.color)) list.push("color");
    if (variants.some((v) => v.type)) list.push("type");
    if (variants.some((v) => v.size)) list.push("size");
    return list;
  }, [variants]);

  const [selected, setSelected] = useState<Partial<Record<Axis, string>>>({});
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(
    product.imageUrls.length > 0 ? product.imageUrls[0] : null
  );

  const matchedVariant: ProductVariant | undefined = useMemo(() => {
    if (!hasVariants) return undefined;
    const match = variants.filter((v) =>
      axes.every((a) => !selected[a] || variantValue(v, a) === selected[a]),
    );
    return match.length === 1 ? match[0] : undefined;
  }, [variants, axes, selected, hasVariants]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (matchedVariant && matchedVariant.imageUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveImage(matchedVariant.imageUrl);
    } else if (product.imageUrls.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveImage(product.imageUrls[0]);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveImage(null);
    }
  }, [matchedVariant, product.imageUrls]);

  const allSelected = axes.every((a) => Boolean(selected[a]));
  const activeStock = hasVariants
    ? matchedVariant?.stock ?? 0
    : product.stock;
  const canAdd = hasVariants
    ? allSelected && Boolean(matchedVariant) && activeStock > 0
    : product.stock > 0;

  const effectiveQty = Math.max(1, Math.min(quantity, activeStock || 1));
  // If a variant has a price override, use it directly; otherwise fall back
  // to tiered product pricing (reseller/promo/wholesale). Compare against
  // null so a legitimate override of 0 is honoured (matches cart + server).
  const variantUnitPrice = matchedVariant?.priceOverride;
  const pricing = variantUnitPrice != null
    ? {
        unitPrice: variantUnitPrice,
        subtotal: variantUnitPrice * effectiveQty,
        appliedType: "retail" as const,
        tierLabel: null,
      }
    : calculatePrice(product, effectiveQty, isReseller);

  const showSale =
    !variantUnitPrice &&
    product.promotionalPrice &&
    product.promotionalPrice < product.retailPrice;



  function setAxis(axis: Axis, value: string) {
    setSelected((prev) => ({ ...prev, [axis]: value }));
  }

  // Values available for a given axis, considering what's already picked
  // on the other axes (so unavailable combinations grey out naturally).
  function optionsFor(axis: Axis): { value: string; disabled: boolean }[] {
    const all = uniq(variants.map((v) => variantValue(v, axis)));
    return all.map((value) => {
      const feasible = variants.some(
        (v) =>
          variantValue(v, axis) === value &&
          axes
            .filter((a) => a !== axis)
            .every((a) => !selected[a] || variantValue(v, a) === selected[a]) &&
          v.stock > 0,
      );
      return { value, disabled: !feasible };
    });
  }

  function handleAdd() {
    if (!canAdd) return;
    // Override the product's frameColor if needed, but since we removed hex swatches,
    // we just use the default.
    const productWithColor = {
      ...product,
    };
    addItem(productWithColor, effectiveQty, matchedVariant);
    const label = matchedVariant
      ? `${product.name} (${[
          matchedVariant.color,
          matchedVariant.type,
          matchedVariant.size,
        ]
          .filter(Boolean)
          .join(" · ")})`
      : product.name;
    setFeedback(`${effectiveQty} × ${label} ditambahkan ke keranjang.`);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
      <div>
        <div className="rounded-2xl bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] aspect-square flex items-center justify-center overflow-hidden p-10">
          {activeImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <GlassesArt product={product} size={360} />
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {product.imageUrls && product.imageUrls.length > 1
            ? product.imageUrls.slice(0, 4).map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={clsx(
                    "rounded-xl bg-[color:var(--color-cloud-100)] border aspect-square overflow-hidden transition-all",
                    activeImage === url
                      ? "border-[color:var(--color-navy-900)] ring-2 ring-[color:var(--color-navy-900)]/20"
                      : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-400)]"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))
            : [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] aspect-square flex items-center justify-center p-3"
                >
                  <GlassesArt product={product} size={70} />
                </div>
              ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-900)]">
          {product.categoryLabel} · SKU {product.sku}
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className="flex items-center text-[color:var(--color-navy-900)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : ""}`}
              />
            ))}
          </div>
          <span className="text-[color:var(--color-muted)]">
            {product.rating.toFixed(1)} ({product.reviewCount} ulasan)
          </span>
        </div>

        <p className="mt-5 text-[color:var(--color-muted)] leading-relaxed">
          {product.description}
        </p>

        <div className="mt-6 space-y-5">
          <div className="flex items-baseline gap-3 flex-wrap">
        <div className="text-3xl sm:text-4xl font-bold text-[color:var(--color-navy-900)]">
          {formatRupiah(pricing.unitPrice)}
        </div>
        <div className="text-sm text-[color:var(--color-muted)]">/ pcs</div>
        {showSale && pricing.appliedType === "promo" && (
          <div className="text-sm text-[color:var(--color-muted)] line-through">
            {formatRupiah(product.retailPrice)}
          </div>
        )}
        {pricing.tierLabel && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]">
            {pricing.tierLabel}
          </span>
        )}
      </div>
      <div className="text-sm">
        Subtotal:{" "}
        <span className="font-semibold text-[color:var(--color-ink)]">
          {formatRupiah(pricing.subtotal)}
        </span>{" "}
        <span className="text-[color:var(--color-muted)]">
          ({effectiveQty} × {formatRupiah(pricing.unitPrice)})
        </span>
      </div>

      {hasVariants && (
        <div className="space-y-4 rounded-xl border border-[color:var(--color-line)] p-4">
          {axes.map((axis) => {
            const options = optionsFor(axis);
            return (
              <div key={axis}>
                <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                  {AXIS_LABEL[axis]}
                  {selected[axis] ? (
                    <span className="ml-2 normal-case tracking-normal text-[color:var(--color-ink)]">
                      {selected[axis]}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map(({ value, disabled }) => {
                    const isActive = selected[axis] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled && !isActive}
                        onClick={() => setAxis(axis, value)}
                        className={clsx(
                          "rounded-full border px-3 py-1.5 text-sm transition",
                          isActive
                            ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white"
                            : disabled
                              ? "border-[color:var(--color-line)] text-[color:var(--color-muted)] line-through cursor-not-allowed"
                              : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-900)]",
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {allSelected && matchedVariant ? (
            <div className="text-xs text-[color:var(--color-muted)]">
              SKU varian {matchedVariant.sku} · Stok {matchedVariant.stock}
            </div>
          ) : (
            <div className="text-xs text-[color:var(--color-muted)]">
              Pilih semua opsi untuk melanjutkan.
            </div>
          )}
        </div>
      )}

      {/* Color swatches */}
      {product.colors.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
            Warna
            {selectedColorHex && (
              <span className="ml-2 normal-case tracking-normal text-[color:var(--color-ink)]">
                {colorName(selectedColorHex)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={colorName(hex)}
                  onClick={() => setSelectedColorHex(hex)}
                  className={clsx(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    selectedColorHex === hex
                      ? "border-[color:var(--color-navy-900)] ring-2 ring-[color:var(--color-navy-900)]/30 scale-110"
                      : "border-[color:var(--color-line)] hover:border-[color:var(--color-navy-400)] hover:scale-105",
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            {/* Live color preview */}
            {!product.imageUrls?.length && (
              <div className="h-16 w-24 rounded-lg bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] flex items-center justify-center overflow-hidden">
                <GlassesArt
                  product={{ ...product, frameColor: activeFrameColor }}
                  size={40}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 w-fit">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-[color:var(--color-line)] overflow-hidden">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              className="h-10 w-10 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={activeStock || 1}
              value={quantity}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) {
                  setQuantity(
                    Math.max(1, Math.min(activeStock || 1, Math.floor(v))),
                  );
                }
              }}
              className="h-10 w-14 text-center text-sm font-semibold border-x border-[color:var(--color-line)] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Tambah jumlah"
              className="h-10 w-10 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
              onClick={() =>
                setQuantity((q) => Math.min(activeStock || 1, q + 1))
              }
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn btn-primary"
          >
            <ShoppingCart className="h-4 w-4" /> Tambah ke Keranjang
          </button>
        </div>

        {/* Marketplace buttons */}
        <div className="grid grid-cols-2 gap-3">
        <a
          href="https://shopee.co.id/juragangrosir"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline justify-center"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.243 2 7 4.243 7 7h2c0-1.654 1.346-3 3-3s3 1.346 3 3h2c0-2.757-2.243-5-5-5zm-7.5 6A1.5 1.5 0 003 9.5v10A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5v-10A1.5 1.5 0 0019.5 8h-15zM12 17c-2.21 0-4-1.79-4-4h1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5H16c0 2.21-1.79 4-4 4z"/>
          </svg>
          Shopee
        </a>
        <a
          href="https://www.tiktok.com/@juragangrosir"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline justify-center"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.48a4.85 4.85 0 01-3.77-1.77V6.69h3.77z"/>
          </svg>
          TikTok
        </a>
      </div>

        <div
          className={clsx(
            "text-sm font-medium transition-all duration-300 overflow-hidden",
            feedback ? "h-6 opacity-100 text-[color:var(--color-success)]" : "h-0 opacity-0",
          )}
          aria-live="polite"
        >
          {feedback}
        </div>
      </div>
    </div>
        
    {/* Tier table */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-2">Harga grosir bertingkat</h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--color-cloud-100)] text-[color:var(--color-muted)]">
                <tr>
                  <th className="text-left font-medium py-2.5 px-4">Jumlah</th>
                  <th className="text-right font-medium py-2.5 px-4">Harga per pcs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-line)]">
                {(() => {
                  const firstTierMin = product.priceTiers[0]?.minQty;
                  const retailRange =
                    firstTierMin && firstTierMin > 1
                      ? `1–${firstTierMin - 1} pcs`
                      : firstTierMin === 1
                        ? "Harga retail"
                        : "1+ pcs";
                  return (
                    <tr>
                      <td className="py-2.5 px-4">{retailRange}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">
                        {formatRupiah(product.retailPrice)}
                      </td>
                    </tr>
                  );
                })()}
                {product.priceTiers.map((t) => (
                  <tr key={t.minQty}>
                    <td className="py-2.5 px-4">
                      {t.maxQty
                        ? `${t.minQty}–${t.maxQty} pcs`
                        : `${t.minQty}+ pcs`}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-[color:var(--color-navy-900)]">
                      {formatRupiah(t.unitPrice)}
                    </td>
                  </tr>
                ))}
                {product.resellerPrice && (
                  <tr className="bg-[color:var(--color-cloud-50)]">
                    <td className="py-2.5 px-4">Harga reseller (disetujui)</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-[color:var(--color-navy-900)]">
                      {formatRupiah(product.resellerPrice)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            Harga grosir otomatis berlaku saat jumlah minimum tercapai.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          {product.specs.map((s) => (
            <div key={s.label}>
              <dt className="text-[color:var(--color-muted)] text-xs">{s.label}</dt>
              <dd className="font-semibold mt-0.5">{s.value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-[color:var(--color-muted)] text-xs">Berat</dt>
            <dd className="font-semibold mt-0.5">{product.weightGram} g</dd>
          </div>
          <div>
            <dt className="text-[color:var(--color-muted)] text-xs">Stok</dt>
            <dd className="font-semibold mt-0.5">{product.stock} pcs tersedia</dd>
          </div>
        </div>
      </div>
    </div>
  );
}

function variantValue(v: ProductVariant, axis: Axis): string | undefined {
  if (axis === "color") return v.color;
  if (axis === "type") return v.type;
  return v.size;
}

