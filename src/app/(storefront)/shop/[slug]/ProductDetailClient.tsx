"use client";

import { Minus, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { whatsappLink, SITE_URL } from "@/lib/constants";

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
  // to tiered product pricing (reseller/promo/wholesale).
  const variantUnitPrice = matchedVariant?.priceOverride;
  const pricing = variantUnitPrice
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

  const wa = whatsappLink(
    `Halo Juragan Grosir, saya ingin bertanya tentang produk: ${product.name} - ${SITE_URL}/shop/${product.slug}`,
  );

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
    addItem(product, effectiveQty, matchedVariant);
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

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          <MessageCircle className="h-4 w-4" /> Tanya via WhatsApp
        </a>
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
    </div>
  );
}

function variantValue(v: ProductVariant, axis: Axis): string | undefined {
  if (axis === "color") return v.color;
  if (axis === "type") return v.type;
  return v.size;
}
