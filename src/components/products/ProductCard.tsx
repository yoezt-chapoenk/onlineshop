import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";
import AddToBagButton from "./AddToBagButton";

interface Props {
  product: ProductSummary;
  className?: string;
}

const FRAME_COLOR_HEX: Record<ProductSummary["frameColor"], string> = {
  black: "#1a1a1a",
  gold: "#c9a96e",
  tortoise: "#4a3728",
  silver: "#e8ddd0",
  navy: "#3a3a3a",
  rose: "#3a3a3a",
  olive: "#3a3a3a",
};

export default function ProductCard({ product, className }: Props) {
  const mappedColor = FRAME_COLOR_HEX[product.frameColor] ?? "#3a3a3a";
  const tag = product.isNewArrival
    ? "New"
    : product.isBestSeller
    ? "Bestseller"
    : null;

  return (
    <div className={`product-card ${className ?? ""}`.trim()}>
      <Link
        href={`/shop/${product.slug}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div className="product-card-media">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 120,
            }}
          >
            <GlassesPlaceholder
              color={mappedColor}
              shape={product.frame}
              width={220}
              height={110}
            />
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
          <div className="product-card-overlay">
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
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
            }}
          >
            {product.categoryLabel}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, color: "var(--gold)", fontWeight: 400 }}>
            {formatRupiah(product.retailPrice)}
          </div>
          {product.hasVariants ? (
            <Link
              href={`/shop/${product.slug}`}
              className="product-card-cta"
              style={{
                marginTop: 6,
                display: "inline-block",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              View Options
            </Link>
          ) : (
            <AddToBagButton
              product={product}
              className="product-card-cta"
            />
          )}
        </div>
      </div>
    </div>
  );
}
