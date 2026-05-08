import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  className?: string;
}

export default function ProductGrid({ products, className }: Props) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "120px 0", color: "var(--text-dim)", fontFamily: "var(--font-sans)" }}>
        No products match your filters yet. Try clearing some filters.
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "56px 32px"
      }}
      className={className}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
