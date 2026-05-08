"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

interface Props {
  product: Product;
  className?: string;
}

export default function ProductCard({ product }: Props) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const hasVariants = (product.variants?.length ?? 0) > 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            position: "relative",
            background: "var(--surface)",
            padding: "40px 32px 32px",
            transition: "transform 0.35s ease",
            transform: hovered ? "translateY(-4px)" : "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 120,
            }}
          >
            <GlassesPlaceholder color={mappedColor} shape={product.frame} width={220} height={110} />
          </div>
          {tag && (
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: tag === "New" ? "var(--gold)" : "var(--surface2)",
                color: tag === "New" ? "var(--bg)" : "var(--gold)",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "4px 10px",
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          )}
          {/* hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--overlay-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text)",
                border: "1px solid rgba(242,237,230,0.3)",
                padding: "10px 24px",
              }}
            >
              Quick View
            </span>
          </div>
        </div>
      </Link>
      
      {/* Info */}
      <div
        style={{
          padding: "18px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 400,
              color: "var(--text)",
              marginBottom: 2,
            }}
          >
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            {product.categoryLabel}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, color: "var(--gold)", fontWeight: 400 }}>
            {formatRupiah(product.retailPrice)}
          </div>
          {hasVariants ? (
            <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
              <button
                style={{
                  marginTop: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: hovered ? "var(--gold)" : "var(--text-dim)",
                  fontFamily: "var(--font-sans)",
                  transition: "color 0.2s",
                  padding: 0,
                }}
              >
                View Options
              </button>
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              style={{
                marginTop: 6,
                background: "none",
                border: "none",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: hovered ? "var(--gold)" : "var(--text-dim)",
                fontFamily: "var(--font-sans)",
                transition: "color 0.2s",
                padding: 0,
                opacity: product.stock === 0 ? 0.5 : 1
              }}
            >
              {added ? "Added" : product.stock === 0 ? "Out of Stock" : "Add to Bag"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
