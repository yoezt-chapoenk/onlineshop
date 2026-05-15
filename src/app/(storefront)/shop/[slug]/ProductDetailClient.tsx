"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

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

  const imageForSelection = useMemo(() => {
    if (matchedVariant?.imageUrl) return matchedVariant.imageUrl;
    if (selected.color) {
      const colorVariant = variants.find(
        (v) => v.color === selected.color && v.imageUrl
      );
      if (colorVariant?.imageUrl) return colorVariant.imageUrl;
    }
    return product.imageUrls.length > 0 ? product.imageUrls[0] : null;
  }, [matchedVariant, selected.color, variants, product.imageUrls]);

  useEffect(() => {
    setActiveImage(imageForSelection);
  }, [imageForSelection]);

  const allSelected = axes.every((a) => Boolean(selected[a]));
  const activeStock = hasVariants
    ? matchedVariant?.stock ?? 0
    : product.stock;
  const canAdd = hasVariants
    ? allSelected && Boolean(matchedVariant) && activeStock > 0
    : product.stock > 0;

  const effectiveQty = Math.max(1, Math.min(quantity, activeStock || 1));
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
    const productWithColor = { ...product };
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

  // Map frameColor to hex
  const mappedColor =
    product.frameColor === "black"
      ? "#1a1a1a"
      : product.frameColor === "gold"
      ? "#c9a96e"
      : product.frameColor === "tortoise"
      ? "#4a3728"
      : product.frameColor === "silver"
      ? "#e8ddd0"
      : "#3a3a3a";

  const tag = product.isNewArrival ? "New" : product.isBestSeller ? "Bestseller" : null;

  return (
    <div>
      <div className="product-detail-grid">

        {/* Visual */}
        <div>
          <div style={{
            background: "var(--bg2)",
            position: "relative",
            aspectRatio: "1 / 1",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                style={{ objectFit: "contain", padding: "8%" }}
                priority
              />
            ) : (
              <GlassesPlaceholder color={mappedColor} shape={product.frame} width={280} height={140} />
            )}

            {tag && (
              <div style={{
                position: "absolute", top: 20, left: 20,
                background: tag === "New" ? "var(--gold)" : "var(--surface2)",
                color: tag === "New" ? "var(--bg)" : "var(--gold)",
                fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                padding: "4px 10px", fontWeight: 600
              }}>
                {tag}
              </div>
            )}
          </div>

          {product.imageUrls && product.imageUrls.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
              {product.imageUrls.slice(0, 4).map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  style={{
                    background: "var(--bg2)", border: activeImage === url ? "2px solid var(--gold)" : "2px solid transparent",
                    aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    padding: 0, overflow: "hidden"
                  }}
                >
                  <Image
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    width={120}
                    height={120}
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ padding: "0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>
            {product.categoryLabel}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400, color: "var(--text)", marginBottom: 6, lineHeight: 1.1 }}>
            {product.name}
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ display: "flex", color: "var(--gold)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  style={{ width: 14, height: 14, fill: i < Math.round(product.rating) ? "currentColor" : "none" }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ fontSize: 22, color: "var(--gold)" }}>
              {formatRupiah(pricing.unitPrice)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ pcs</div>
            {showSale && pricing.appliedType === "promo" && (
              <div style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "line-through" }}>
                {formatRupiah(product.retailPrice)}
              </div>
            )}
            {pricing.tierLabel && (
              <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(201,169,110,0.1)", color: "var(--gold)" }}>
                {pricing.tierLabel}
              </span>
            )}
          </div>

          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36 }}>
            {product.description}
          </p>

          {hasVariants && (
            <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 20 }}>
              {axes.map((axis) => {
                const options = optionsFor(axis);
                return (
                  <div key={axis}>
                    <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 12 }}>
                      {AXIS_LABEL[axis]}
                      {selected[axis] ? (
                        <span style={{ marginLeft: 8, textTransform: "none", color: "var(--text)", letterSpacing: "normal" }}>
                          {selected[axis]}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {options.map(({ value, disabled }) => {
                        const isActive = selected[axis] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={disabled && !isActive}
                            onClick={() => setAxis(axis, value)}
                            style={{
                              background: isActive ? "var(--gold)" : "none",
                              color: isActive ? "var(--bg)" : disabled ? "var(--text-dim)" : "var(--text-muted)",
                              border: `1px solid ${isActive ? "var(--gold)" : "var(--border)"}`,
                              padding: "8px 16px", fontSize: 12, cursor: disabled && !isActive ? "not-allowed" : "pointer",
                              textDecoration: disabled && !isActive ? "line-through" : "none",
                              transition: "all 0.2s",
                              fontFamily: "var(--font-sans)"
                            }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                {allSelected && matchedVariant ? (
                  `Stok ${matchedVariant.stock} pcs`
                ) : (
                  "Pilih semua opsi untuk melanjutkan."
                )}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, marginBottom: 20, color: "var(--text)" }}>
            Subtotal:{" "}
            <span style={{ fontWeight: 600 }}>{formatRupiah(pricing.subtotal)}</span>{" "}
            <span style={{ color: "var(--text-muted)" }}>
              ({effectiveQty} × {formatRupiah(pricing.unitPrice)})
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", background: "var(--bg)" }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 44, height: 44, background: "none", border: "none", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <input
                type="number"
                min={1}
                max={activeStock || 1}
                value={quantity}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) {
                    setQuantity(Math.max(1, Math.min(activeStock || 1, Math.floor(v))));
                  }
                }}
                style={{ width: 44, height: 44, background: "none", border: "none", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", textAlign: "center", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "var(--font-sans)" }}
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(activeStock || 1, q + 1))}
                style={{ width: 44, height: 44, background: "none", border: "none", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                flex: 1, minWidth: 200, background: "var(--gold)", color: "var(--bg)",
                border: "none", cursor: canAdd ? "pointer" : "not-allowed", padding: "0 24px", height: 44,
                fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                fontFamily: "var(--font-sans)", fontWeight: 500,
                transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: canAdd ? 1 : 0.5
              }}
              onMouseEnter={(e) => canAdd && (e.currentTarget.style.background = "var(--gold-light)")}
              onMouseLeave={(e) => canAdd && (e.currentTarget.style.background = "var(--gold)")}
            >
              <ShoppingCart style={{ width: 16, height: 16 }} />
              Add to Bag
            </button>
          </div>

          <div
            style={{
              fontSize: 13, fontWeight: 500, transition: "opacity 0.3s",
              color: "var(--gold)", height: 24, opacity: feedback ? 1 : 0
            }}
          >
            {feedback}
          </div>

          <div style={{ marginTop: 24, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            Free shipping on orders over Rp 200.000 · 30-day returns · Complimentary case included
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <a
              href="https://shopee.co.id/juragangrosir"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none", fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C9.243 2 7 4.243 7 7h2c0-1.654 1.346-3 3-3s3 1.346 3 3h2c0-2.757-2.243-5-5-5zm-7.5 6A1.5 1.5 0 003 9.5v10A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5v-10A1.5 1.5 0 0019.5 8h-15zM12 17c-2.21 0-4-1.79-4-4h1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5H16c0 2.21-1.79 4-4 4z"/>
              </svg>
              Shopee
            </a>
            <a
              href="https://www.tiktok.com/@juragangrosir"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none", fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.48a4.85 4.85 0 01-3.77-1.77V6.69h3.77z"/>
              </svg>
              TikTok
            </a>
          </div>
        </div>
      </div>

      {/* Tier table + specs sit full-width below the image/details split so
          both blocks have room to breathe on desktop. */}
      <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48 }}>
          {/* Tier table */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>Harga grosir bertingkat</h3>
            <div style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", fontSize: 13, color: "var(--text)" }}>
              <thead style={{ background: "var(--bg2)", color: "var(--text-muted)", textAlign: "left" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontWeight: 500 }}>Jumlah</th>
                  <th style={{ padding: "12px 16px", fontWeight: 500, textAlign: "right" }}>Harga per pcs</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const firstTierMin = product.priceTiers[0]?.minQty;
                  const retailRange =
                    firstTierMin && firstTierMin > 1
                      ? `1–${firstTierMin - 1} pcs`
                      : firstTierMin === 1
                        ? "Harga retail"
                        : "1+ pcs";
                  return (
                    <tr style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px" }}>{retailRange}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--gold)", fontWeight: 600 }}>
                        {formatRupiah(product.retailPrice)}
                      </td>
                    </tr>
                  );
                })()}
                {product.priceTiers.map((t) => (
                  <tr key={t.minQty} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      {t.maxQty
                        ? `${t.minQty}–${t.maxQty} pcs`
                        : `${t.minQty}+ pcs`}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--gold)", fontWeight: 600 }}>
                      {formatRupiah(t.unitPrice)}
                    </td>
                  </tr>
                ))}
                {product.resellerPrice && (
                  <tr style={{ borderTop: "1px solid var(--border)", background: "rgba(201,169,110,0.05)" }}>
                    <td style={{ padding: "12px 16px" }}>Harga reseller</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--gold)", fontWeight: 600 }}>
                      {formatRupiah(product.resellerPrice)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            <p style={{ marginTop: 12, fontSize: 11, color: "var(--text-dim)" }}>
              Harga grosir otomatis berlaku saat jumlah minimum tercapai.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>Detail Spesifikasi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
          {product.specs.map((s) => (
            <div key={s.label}>
              <dt style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>{s.label}</dt>
              <dd style={{ color: "var(--text)", fontWeight: 500 }}>{s.value}</dd>
            </div>
          ))}
          <div>
            <dt style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>Berat</dt>
            <dd style={{ color: "var(--text)", fontWeight: 500 }}>{product.weightGram} g</dd>
          </div>
          <div>
            <dt style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>Stok Tersedia</dt>
            <dd style={{ color: "var(--text)", fontWeight: 500 }}>{product.stock} pcs</dd>
          </div>
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

