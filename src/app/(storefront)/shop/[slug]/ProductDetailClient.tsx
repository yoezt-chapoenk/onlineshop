"use client";

import { Minus, Plus, ShoppingCart, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(
    product.colors.length > 0 ? product.colors[0] : null,
  );

  // Map the selected hex to a frameColor for GlassesArt rendering
  const activeFrameColor = selectedColorHex
    ? hexToFrameColor(selectedColorHex)
    : product.frameColor;

  // Find the single variant matching the current axis selection.
  const matchedVariant: ProductVariant | undefined = useMemo(() => {
    if (!hasVariants) return undefined;
    const match = variants.filter((v) =>
      axes.every((a) => !selected[a] || variantValue(v, a) === selected[a]),
    );
    return match.length === 1 ? match[0] : undefined;
  }, [variants, axes, selected, hasVariants]);

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
    // Override the product's frameColor with the user's color selection
    const productWithColor = {
      ...product,
      frameColor: activeFrameColor,
    };
    addItem(productWithColor, effectiveQty, matchedVariant);
    const colorLabel = selectedColorHex ? colorName(selectedColorHex) : null;
    const label = matchedVariant
      ? `${product.name} (${[
          matchedVariant.color,
          matchedVariant.type,
          matchedVariant.size,
        ]
          .filter(Boolean)
          .join(" · ")})`
      : colorLabel
        ? `${product.name} — ${colorLabel}`
        : product.name;
    setFeedback(`${effectiveQty} × ${label} ditambahkan ke keranjang.`);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  return (
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

      <div
        className={clsx(
          "text-sm font-medium transition-opacity",
          feedback ? "opacity-100 text-[color:var(--color-success)]" : "opacity-0",
        )}
        aria-live="polite"
      >
        {feedback ?? "."}
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
    </div>
  );
}

function variantValue(v: ProductVariant, axis: Axis): string | undefined {
  if (axis === "color") return v.color;
  if (axis === "type") return v.type;
  return v.size;
}

/** Map common hex colors to human-readable Indonesian names. */
const COLOR_NAMES: Record<string, string> = {
  "#000000": "Hitam",
  "#ffffff": "Putih",
  "#01083c": "Navy Gelap",
  "#1a225a": "Navy",
  "#2a3470": "Biru Tua",
  "#2a6df0": "Biru",
  "#7cabff": "Biru Muda",
  "#aab2cf": "Abu-Abu",
  "#495489": "Slate",
  "#060c3f": "Midnight",
};

function colorName(hex: string): string {
  return COLOR_NAMES[hex.toLowerCase()] ?? hex;
}

/** Map hex color to the closest GlassesArt frameColor. */
const HEX_TO_FRAME: Record<string, Product["frameColor"]> = {
  "#000000": "black",
  "#01083c": "navy",
  "#060c3f": "black",
  "#1a225a": "navy",
  "#2a3470": "olive",
  "#2a6df0": "navy",
  "#7cabff": "rose",
  "#aab2cf": "silver",
  "#495489": "olive",
  "#ffffff": "silver",
};

function hexToFrameColor(hex: string): Product["frameColor"] {
  return HEX_TO_FRAME[hex.toLowerCase()] ?? "black";
}
